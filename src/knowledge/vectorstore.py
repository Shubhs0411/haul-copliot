from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings
from chromadb.utils.embedding_functions import EmbeddingFunction
from google import genai
from google.genai import types as genai_types

from .regulations import RegulationLoader, RegulationChunk


CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")
EMBED_MODEL = os.getenv("EMBED_MODEL", "gemini-embedding-001")


class GeminiEmbeddingFunction(EmbeddingFunction):
    """
    Chroma embedding function backed by the Gemini embeddings API.
    Avoids loading a local sentence-transformers/torch model, which is too
    heavy (500MB+ RAM) for small hosts like Render's free tier.
    """

    def __init__(self, model_name: str = EMBED_MODEL, api_key: str | None = None) -> None:
        self.model_name = model_name
        self._api_key = api_key
        self._client: genai.Client | None = None

    @property
    def client(self) -> genai.Client:
        # Lazy so constructing a FreightKnowledgeBase doesn't require GOOGLE_API_KEY
        # unless an embedding call actually happens (e.g. in unit tests).
        if self._client is None:
            self._client = genai.Client(api_key=self._api_key or os.getenv("GOOGLE_API_KEY"))
        return self._client

    def __call__(self, input: list[str]) -> list[list[float]]:
        return self._embed(list(input), task_type="RETRIEVAL_DOCUMENT")

    def embed_query(self, input: list[str]) -> list[list[float]]:
        return self._embed(list(input), task_type="RETRIEVAL_QUERY")

    def _embed(self, texts: list[str], task_type: str) -> list[list[float]]:
        response = self.client.models.embed_content(
            model=self.model_name,
            contents=texts,
            config=genai_types.EmbedContentConfig(task_type=task_type),
        )
        return [e.values for e in response.embeddings]

    @staticmethod
    def name() -> str:
        return "gemini"

    def default_space(self) -> str:
        return "cosine"

    def supported_spaces(self) -> list[str]:
        return ["cosine", "l2", "ip"]

    @staticmethod
    def build_from_config(config: dict[str, Any]) -> "GeminiEmbeddingFunction":
        return GeminiEmbeddingFunction(model_name=config.get("model_name", EMBED_MODEL))

    def get_config(self) -> dict[str, Any]:
        return {"model_name": self.model_name}

    def validate_config_update(self, old_config: dict[str, Any], new_config: dict[str, Any]) -> None:
        return

    @staticmethod
    def validate_config(config: dict[str, Any]) -> None:
        return


class FreightKnowledgeBase:
    """
    ChromaDB-backed knowledge base for FMCSA/DOT regulations.
    Provides semantic search over ~4 regulatory domains with metadata filtering.
    """

    COLLECTION_NAME = "freight_regulations"

    def __init__(self, persist_dir: str = CHROMA_DIR) -> None:
        Path(persist_dir).mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )
        embedding_fn = GeminiEmbeddingFunction(model_name=EMBED_MODEL)
        try:
            self._collection = self._client.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
                embedding_function=embedding_fn,
            )
        except ValueError as e:
            # Existing local collection may be pinned to Chroma's default ONNX embedding.
            # Recreate it so this project can run on systems where onnxruntime is unavailable.
            if "Embedding function conflict" not in str(e):
                raise
            self._client.delete_collection(self.COLLECTION_NAME)
            self._collection = self._client.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
                embedding_function=embedding_fn,
            )
        self._loader = RegulationLoader()

    def ingest(self, force: bool = False) -> int:
        """Load regulations into ChromaDB. Returns number of chunks ingested."""
        if not force and self._collection.count() > 0:
            return self._collection.count()

        chunks = self._loader.load_all()
        if not chunks:
            return 0

        ids = [c.id for c in chunks]
        documents = [c.content for c in chunks]
        metadatas = [
            {
                "title": c.title,
                "citation": c.citation,
                "category": c.category,
                "keywords": ", ".join(c.keywords),
            }
            for c in chunks
        ]

        self._collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
        return len(chunks)

    def search(
        self,
        query: str,
        n_results: int = 5,
        category_filter: str | None = None,
    ) -> list[dict[str, Any]]:
        """Semantic search over regulations. Returns ranked list of relevant chunks."""
        where: dict[str, Any] | None = None
        if category_filter:
            where = {"category": {"$eq": category_filter}}

        results = self._collection.query(
            query_texts=[query],
            n_results=min(n_results, max(1, self._collection.count())),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        hits = []
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i]
            distance = results["distances"][0][i]
            relevance = round(1.0 - distance, 4)
            hits.append(
                {
                    "content": doc,
                    "title": metadata.get("title", ""),
                    "citation": metadata.get("citation", ""),
                    "category": metadata.get("category", ""),
                    "relevance": relevance,
                }
            )
        return sorted(hits, key=lambda x: x["relevance"], reverse=True)

    def get_context_for_query(self, query: str, max_tokens: int = 2000) -> str:
        """Build a context string from top search results, budget-capped."""
        hits = self.search(query, n_results=6)
        context_parts: list[str] = []
        total_chars = 0
        char_budget = max_tokens * 4  # rough chars-per-token estimate

        for hit in hits:
            chunk = f"[{hit['citation']}]\n{hit['content']}\n"
            if total_chars + len(chunk) > char_budget:
                break
            context_parts.append(chunk)
            total_chars += len(chunk)

        return "\n---\n".join(context_parts)

    @property
    def count(self) -> int:
        return self._collection.count()

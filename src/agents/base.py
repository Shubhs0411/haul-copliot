from __future__ import annotations

import os
import time
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

from google import genai
from google.genai import types

from src.models.domain import AgentTrace, QueryIntent
from src.observability.tracer import get_tracer


AGENT_MODEL = os.getenv("AGENT_MODEL", "gemini-2.5-flash-lite")
ORACLE_MODEL = os.getenv("ORACLE_MODEL", "gemini-2.5-flash")


def _to_gemini_tool(tool: dict[str, Any]) -> types.Tool:
    """Convert an Anthropic-style {name, description, input_schema} tool def to a Gemini FunctionDeclaration."""
    return types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name=tool["name"],
                description=tool.get("description", ""),
                parameters=tool.get("input_schema"),
            )
        ]
    )


class BaseComplianceAgent(ABC):
    """
    Base class for all HaulCopilot compliance agents.
    Handles tracing, token accounting, and structured tool-use loops with Gemini.
    """

    name: str = "base"
    model: str = AGENT_MODEL

    def __init__(self) -> None:
        self._client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self._tracer = get_tracer()

    @property
    @abstractmethod
    def system_prompt(self) -> str: ...

    @property
    @abstractmethod
    def tools(self) -> list[dict[str, Any]]: ...

    @abstractmethod
    def _dispatch_tool(self, tool_name: str, tool_input: dict[str, Any]) -> str: ...

    def run(self, query: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        trace = AgentTrace(
            trace_id=str(uuid.uuid4()),
            agent_name=self.name,
            query=query,
            model_used=self.model,
            started_at=datetime.utcnow(),
        )
        t0 = time.perf_counter()

        try:
            result = self._agentic_loop(query, context or {}, trace)
            trace.completed_at = datetime.utcnow()
            trace.latency_ms = (time.perf_counter() - t0) * 1000
            self._tracer.record(trace)
            return result
        except Exception as e:
            trace.error = str(e)
            trace.completed_at = datetime.utcnow()
            trace.latency_ms = (time.perf_counter() - t0) * 1000
            self._tracer.record(trace)
            raise

    def _agentic_loop(
        self,
        query: str,
        context: dict[str, Any],
        trace: AgentTrace,
        max_iterations: int = 10,
    ) -> dict[str, Any]:
        contents: list[types.Content] = [
            types.Content(role="user", parts=[types.Part(text=query)])
        ]
        gemini_tools = [_to_gemini_tool(t) for t in self.tools]
        config = types.GenerateContentConfig(
            system_instruction=self.system_prompt,
            max_output_tokens=4096,
            tools=gemini_tools,
        )

        for _ in range(max_iterations):
            response = self._client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config,
            )
            usage = response.usage_metadata
            if usage:
                trace.input_tokens += usage.prompt_token_count or 0
                trace.output_tokens += usage.candidates_token_count or 0

            function_calls = response.function_calls or []

            if not function_calls:
                text = response.text or ""
                return {"response": text, "trace": trace}

            candidate_content = response.candidates[0].content
            contents.append(candidate_content)

            function_response_parts = []
            for call in function_calls:
                trace.tools_called.append(call.name)
                result_str = self._dispatch_tool(call.name, dict(call.args or {}))
                trace.tool_results.append(
                    {"tool": call.name, "input": call.args, "result": result_str[:500]}
                )
                function_response_parts.append(
                    types.Part.from_function_response(
                        name=call.name,
                        response={"result": result_str},
                    )
                )

            contents.append(types.Content(role="user", parts=function_response_parts))

        return {"response": "Max iterations reached", "trace": trace}

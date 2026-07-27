import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Architecture } from "@/components/Architecture";
import { DemoSection } from "@/components/DemoSection";
import { StatusPanel } from "@/components/StatusPanel";
import { ApiSurface } from "@/components/ApiSurface";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Architecture />
        <DemoSection />
        <StatusPanel />
        <ApiSurface />
      </main>
      <Footer />
    </>
  );
}

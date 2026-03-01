import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ShowcaseImages } from "@/components/landing/showcase-images";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a0a] overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      <LandingNavbar />

      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ShowcaseImages />
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-xs md:text-sm text-zinc-600 border-t border-white/5 bg-black/20">
        <p>© {new Date().getFullYear()} Jewelshot®. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

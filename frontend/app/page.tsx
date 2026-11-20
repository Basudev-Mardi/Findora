import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeLiveContent } from "@/components/home/HomeLiveContent";
import { FaqSection } from "@/components/home/FaqSection";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <HomeLiveContent />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}

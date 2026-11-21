import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { HeroLiveBadge } from "./HeroLiveBadge";

export function HeroSection() {
  return (
    <section className="px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-[#142D3B]/10 bg-[#142D3B] shadow-[0_24px_60px_rgba(20,45,59,0.16)]">
          {/* Background Campus Photograph */}
          <div className="relative min-h-[540px] w-full sm:min-h-[580px] lg:min-h-[620px]">
            <Image
              src="/images/campus.webp"
              alt="Modern university campus quad with students, greenery, and academic buildings"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
            />

            {/* Editorial Directional Scrim for Crisp Readability */}
            <div
              className="absolute inset-0 bg-[#142D3B]/75 lg:bg-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(98deg, rgba(20,45,59,0.92) 0%, rgba(20,45,59,0.82) 44%, rgba(20,45,59,0.28) 76%, rgba(20,45,59,0.12) 100%)",
              }}
              aria-hidden="true"
            />

            {/* Content Layer */}
            <div className="relative z-10 flex min-h-[540px] flex-col justify-between p-6 sm:min-h-[580px] sm:p-10 lg:min-h-[620px] lg:flex-row lg:items-end lg:p-14">
              {/* Left Editorial Copy */}
              <div className="max-w-xl py-4 lg:py-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#C9FD04]" />
                  One Campus. One Community. Every Belonging Matters.
                </div>

                <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                  Lost Something?{" "}
                  <span className="text-[#C9FD04]">Let&apos;s Bring It Back.</span>
                </h1>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                  From misplaced essentials to unexpected discoveries, connect
                  with your campus community and give lost belongings a second
                  chance at finding their way home.
                </p>

                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <Link
                    href="/report/lost"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9FD04] px-6 py-3.5 text-sm font-bold text-[#142D3B] shadow-sm transition-all duration-200 hover:bg-[#d6ff38] hover:shadow-md"
                  >
                    Report Lost Item
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/found"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white/20"
                  >
                    <Search className="h-4 w-4" />
                    Explore Found Items
                  </Link>
                </div>
              </div>

              {/* Right Live Campus Activity Overlay */}
              <HeroLiveBadge />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

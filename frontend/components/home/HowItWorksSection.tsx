import Link from "next/link";
import { ArrowRight, Compass, FilePlus2, Handshake } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/data/homepage";

const STEP_ICONS = [FilePlus2, Compass, Handshake];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-[#E7EBE8] bg-white px-4 py-18 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
              Simple Process
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#142D3B] sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#7B858B]">
              Designed for busy campus days—three clear steps from noticing an
              item is missing to getting it safely back in your hands.
            </p>
          </div>

          <Link
            href="/report"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-[#1F6B50] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#142D3B] lg:self-auto"
          >
            Start a Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div
                key={step.number}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] p-7 transition-all duration-300 hover:border-[#1F6B50]/35 hover:bg-white hover:shadow-[0_12px_28px_rgba(20,45,59,0.06)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wider text-[#1F6B50]">
                      <span>{step.number}</span>
                      <span className="h-px w-5 bg-[#1F6B50]/40" />
                      <span className="uppercase text-[#142D3B]">
                        {step.title}
                      </span>
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7EBE8] bg-white text-[#142D3B] transition-colors group-hover:border-[#1F6B50]/20 group-hover:bg-[#142D3B] group-hover:text-[#C9FD04]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#142D3B]">
                    {step.number} &mdash; {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#7B858B]">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 h-1 w-10 rounded-full bg-[#E7EBE8] transition-all duration-300 group-hover:w-16 group-hover:bg-[#1F6B50]" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

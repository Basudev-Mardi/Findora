"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/data/homepage";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
              Common Questions
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#142D3B]">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#7B858B] sm:text-base">
              Everything you need to know about reporting items, verifying
              ownership, and staying safe during campus handoffs.
            </p>
            <div className="mt-6">
              <Link
                href="/report"
                className="inline-flex items-center text-sm font-semibold text-[#1F6B50] underline decoration-[#1F6B50]/30 underline-offset-4 transition-colors hover:text-[#142D3B] hover:decoration-[#142D3B]"
              >
                Need to log an item right now? Go to Report &rarr;
              </Link>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-8">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white transition-colors hover:border-[#142D3B]/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-[#142D3B] sm:text-base">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#7B858B] transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#1F6B50]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#E7EBE8] px-6 py-4 text-sm leading-relaxed text-[#7B858B]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

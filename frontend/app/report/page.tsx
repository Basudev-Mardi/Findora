import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Report an Item — Findora",
  description:
    "Choose whether to report a lost belonging or log a found item on campus.",
};

export default function ReportHubPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
              Campus Reporting
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#142D3B] sm:text-4xl">
              What would you like to report?
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#7B858B] sm:text-base">
              Select the report type below. Public listing details are separated
              from private verification details to keep every handoff safe.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link
              href="/report/lost"
              className="group flex flex-col justify-between rounded-3xl border border-[#E7EBE8] bg-white p-7 shadow-[0_1px_3px_rgba(20,45,59,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#142D3B]/30 hover:shadow-[0_16px_32px_rgba(20,45,59,0.08)]"
            >
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142D3B] text-[#C9FD04]">
                  <Search className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-[#142D3B]">
                  Report Lost Item
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
                  Misplaced something on campus? Post where it was last seen and
                  optionally attach a photo so others can spot it.
                </p>
              </div>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#142D3B] transition-colors group-hover:text-[#1F6B50]">
                Open Lost Item Form
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/report/found"
              className="group flex flex-col justify-between rounded-3xl border border-[#E7EBE8] bg-white p-7 shadow-[0_1px_3px_rgba(20,45,59,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1F6B50]/40 hover:shadow-[0_16px_32px_rgba(20,45,59,0.08)]"
            >
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F6B50] text-[#C9FD04]">
                  <Compass className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-xl font-bold text-[#142D3B]">
                  Report Found Item
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
                  Found a belonging in a lecture hall, library, or quad? Log it
                  safely while keeping verification clues private.
                </p>
              </div>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#1F6B50] transition-colors group-hover:text-[#142D3B]">
                Open Found Item Form
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

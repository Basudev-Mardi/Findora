import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Get Started — Findora",
  description: "Start reporting lost or found items across your campus.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#E7EBE8] bg-white p-8 shadow-[0_12px_36px_rgba(20,45,59,0.06)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1F6B50]/10 px-3 py-1 text-xs font-semibold text-[#1F6B50]">
            One Campus. One Community.
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#142D3B]">
            Get Started with Findora
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
            Jump straight into your student dashboard or submit a lost or found
            item report right away.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-between rounded-2xl bg-[#142D3B] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
            >
              <span>Open My Dashboard</span>
              <ArrowRight className="h-4 w-4 text-[#C9FD04]" />
            </Link>
            <Link
              href="/report/lost"
              className="flex items-center justify-between rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] px-5 py-3.5 text-sm font-semibold text-[#142D3B] hover:bg-white"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#1F6B50]" />
                Report a Lost Item
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/report/found"
              className="flex items-center justify-between rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] px-5 py-3.5 text-sm font-semibold text-[#142D3B] hover:bg-white"
            >
              <span className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#1F6B50]" />
                Report a Found Item
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

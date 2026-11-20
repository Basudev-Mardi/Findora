import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, UserCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Login — Findora",
  description: "Access your Findora student dashboard or administrator console.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#E7EBE8] bg-white p-8 shadow-[0_12px_36px_rgba(20,45,59,0.06)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1F6B50]/10 px-3 py-1 text-xs font-semibold text-[#1F6B50]">
            Campus Demo Access
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#142D3B]">
            Welcome back to Findora
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
            Choose your workspace below. Full campus SSO authentication is ready
            to plug in; local demo mode lets you test both student and admin
            workflows immediately.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-between rounded-2xl bg-[#142D3B] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
            >
              <span className="flex items-center gap-2.5">
                <UserCheck className="h-4 w-4 text-[#C9FD04]" />
                Continue to Student Dashboard
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/admin"
              className="flex items-center justify-between rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] px-5 py-4 text-sm font-semibold text-[#142D3B] transition-colors hover:bg-white"
            >
              <span className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-[#1F6B50]" />
                Administrator Console
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

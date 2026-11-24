"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Lock, Mail, User } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useStudentAuth } from "./StudentAuthContext";

export function StudentRegisterView() {
  const router = useRouter();
  const { login } = useStudentAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid campus email address.");
      return;
    }
    if (password.trim().length < 4) {
      setErrorMessage("Password must be at least 4 characters.");
      return;
    }

    setErrorMessage(null);
    login({
      userId: "usr-demo-1",
      name: trimmedName,
      email: trimmedEmail,
    });
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <header className="border-b border-[#E7EBE8] bg-[#F7F8F5]/85 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo variant="dark" />
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-white px-3.5 py-2 text-xs font-semibold text-[#142D3B] transition-colors hover:bg-[#F7F8F5]"
          >
            <Lock className="h-3.5 w-3.5 text-[#1F6B50]" />
            Admin Console
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#E7EBE8] bg-white p-8 shadow-[0_16px_44px_rgba(20,45,59,0.08)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1F6B50]/10 px-3 py-1 text-xs font-semibold text-[#1F6B50]">
            One Campus. One Community.
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#142D3B]">
            Create Student Account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
            Sign up with your campus details to access Findora and report or
            claim lost belongings.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Full Name
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
                <input
                  id="register-name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Aarav Sharma"
                  className="h-11 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-10 pr-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Campus Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="h-11 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-10 pr-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
                <input
                  id="register-password"
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="h-11 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-10 pr-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
            >
              Continue to Homepage
              <ArrowRight className="h-4 w-4 text-[#C9FD04]" />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-[#E7EBE8] pt-4 text-xs text-[#7B858B]">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              Sign In &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import {
  DEMO_STUDENTS,
  type StudentSession,
  useStudentAuth,
} from "./StudentAuthContext";

function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Student";
  return local
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StudentLoginView() {
  const router = useRouter();
  const { login, student } = useStudentAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function completeLogin(session: StudentSession) {
    login(session);
    router.replace("/");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid campus email address.");
      return;
    }
    if (password.trim().length < 4) {
      setErrorMessage("Password must be at least 4 characters.");
      return;
    }

    setErrorMessage(null);
    const matchedDemo = DEMO_STUDENTS.find(
      (demo) => demo.email.toLowerCase() === trimmedEmail
    );

    completeLogin(
      matchedDemo ?? {
        userId: "usr-demo-1",
        name: deriveNameFromEmail(trimmedEmail) || "Campus Student",
        email: trimmedEmail,
      }
    );
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
            Campus Student Portal
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#142D3B]">
            Sign in to Findora
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
            Log in with your campus email to browse lost &amp; found items,
            report belongings, and track claims.
          </p>

          {student && (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-[#1F6B50]/25 bg-[#1F6B50]/[0.06] px-4 py-3 text-xs text-[#142D3B]">
              <span>
                Signed in as <strong>{student.name}</strong>
              </span>
              <Link
                href="/"
                className="font-semibold text-[#1F6B50] hover:underline"
              >
                Go to Home &rarr;
              </Link>
            </div>
          )}

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
                htmlFor="student-email"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Campus Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
                <input
                  id="student-email"
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
                htmlFor="student-password"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
                <input
                  id="student-password"
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-10 pr-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
            >
              Sign In to Homepage
              <ArrowRight className="h-4 w-4 text-[#C9FD04]" />
            </button>
          </form>

          <div className="mt-6 border-t border-[#E7EBE8] pt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7B858B]">
              Quick Demo Student Sign-In
            </p>
            <div className="mt-3 space-y-2">
              {DEMO_STUDENTS.slice(0, 2).map((demo) => (
                <button
                  key={demo.userId}
                  type="button"
                  onClick={() => completeLogin(demo)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2.5 text-left text-xs font-semibold text-[#142D3B] transition-colors hover:border-[#1F6B50]/40 hover:bg-white"
                >
                  <span className="flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-[#1F6B50]" />
                    <span>
                      <span className="block">{demo.name}</span>
                      <span className="font-normal text-[#7B858B]">
                        {demo.email}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#7B858B]" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#E7EBE8] pt-4 text-xs text-[#7B858B]">
            <span>New to Findora?</span>
            <Link
              href="/register"
              className="font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              Create Student Account &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

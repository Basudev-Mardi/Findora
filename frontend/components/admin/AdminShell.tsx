"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Menu,
  PackageSearch,
  Search,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAdminAuth } from "./AdminAuthContext";

const SIDEBAR_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Lost Items", href: "/admin/lost-items", icon: Search },
  { label: "Found Items", href: "/admin/found-items", icon: PackageSearch },
  { label: "Claim Requests", href: "/admin/claims", icon: ClipboardCheck },
  { label: "Recovered Items", href: "/admin/recovered", icon: CheckCircle2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    isAuthorized,
    isCheckingSession,
    isAuthorizing,
    authError,
    authorize,
    signOut,
  } = useAdminAuth();

  const [keyInput, setKeyInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F5]">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E7EBE8] bg-white px-6 py-4 text-sm font-medium text-[#142D3B]">
          <Loader2 className="h-4 w-4 animate-spin text-[#1F6B50]" />
          Verifying administrator session...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8F5] px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#E7EBE8] bg-white p-8 shadow-[0_16px_44px_rgba(20,45,59,0.08)]">
          <div className="flex items-center justify-between">
            <Logo variant="dark" />
            <span className="rounded-full bg-[#142D3B]/8 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#142D3B]">
              Demo Admin Mode
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#142D3B]">
            Admin Dashboard Sign In
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
            Backend routes enforce administrator authorization via{" "}
            <code className="rounded bg-[#F7F8F5] px-1.5 py-0.5 font-mono text-xs text-[#142D3B]">
              x-admin-key
            </code>
            . Enter your admin key to manage campus listings and private claim
            verifications.
          </p>

          {authError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await authorize(keyInput);
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="admin-dashboard-key"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Administrator API Key
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
                <input
                  id="admin-dashboard-key"
                  type="password"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter ADMIN_API_KEY"
                  className="h-11 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-10 pr-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                />
              </div>
              {process.env.NODE_ENV !== "production" && (
                <p className="mt-2 text-[11px] text-[#7B858B]">
                  Local demo key:{" "}
                  <button
                    type="button"
                    onClick={() => setKeyInput("findora-admin-demo-key")}
                    className="rounded bg-[#F7F8F5] px-1.5 py-0.5 font-mono font-semibold text-[#1F6B50] underline decoration-[#1F6B50]/40 underline-offset-2 hover:text-[#142D3B]"
                  >
                    findora-admin-demo-key
                  </button>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthorizing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50] disabled:opacity-60"
            >
              {isAuthorizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying with Backend...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-[#C9FD04]" />
                  Access Admin Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#E7EBE8] pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B858B] hover:text-[#142D3B]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Findora Campus Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentNav =
    SIDEBAR_ITEMS.find((item) => item.href === pathname) ?? SIDEBAR_ITEMS[0];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#142D3B] text-white">
      <div className="flex h-18 items-center justify-between border-b border-white/10 px-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2.5"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9FD04] text-[#142D3B]">
            <Compass className="h-5 w-5 stroke-[2.25]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-white">
              Findora
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C9FD04]">
              Admin Console
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Admin Navigation">
        {SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/12 font-semibold text-white"
                  : "text-white/70 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-[#C9FD04]" : "text-white/55"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1.5 border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Public Site
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Lock &amp; Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F8F5]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-68 max-w-[82vw] shadow-2xl">{sidebarContent}</div>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 bg-[#142D3B]/45 backdrop-blur-xs"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#E7EBE8] bg-[#F7F8F5]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7EBE8] bg-white text-[#142D3B] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1F6B50]">
                Findora Administration
              </p>
              <h1 className="text-base font-bold text-[#142D3B] sm:text-lg">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#1F6B50]/20 bg-[#1F6B50]/8 px-3 py-1 text-xs font-semibold text-[#1F6B50] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1F6B50]" />
              Demo Admin Authenticated
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

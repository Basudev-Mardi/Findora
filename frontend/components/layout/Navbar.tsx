"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Lost Items", href: "/lost" },
  { label: "Found Items", href: "/found" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "How It Works", href: "/#how-it-works" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7EBE8] bg-[#F7F8F5]/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo variant="dark" />

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#202B32] transition-colors hover:bg-[#142D3B]/5 hover:text-[#142D3B]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#142D3B] transition-colors hover:bg-[#142D3B]/5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#142D3B] px-4.5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#1F6B50]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-[#E7EBE8] bg-white text-[#142D3B] transition-colors hover:bg-[#F7F8F5]"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7EBE8] bg-white px-4 pb-5 pt-3 shadow-lg">
          <nav className="flex flex-col gap-1" aria-label="Mobile Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#202B32] transition-colors hover:bg-[#F7F8F5]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-[#E7EBE8] pt-4">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-xl border border-[#E7EBE8] px-4 py-2.5 text-center text-sm font-semibold text-[#142D3B] transition-colors hover:bg-[#F7F8F5]"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-xl bg-[#142D3B] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";

const PLATFORM_LINKS = [
  { label: "Home", href: "/" },
  { label: "Lost Items", href: "/lost" },
  { label: "Found Items", href: "/found" },
  { label: "User Dashboard", href: "/dashboard" },
  { label: "Report an Item", href: "/report" },
];

const RESOURCE_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Community Impact", href: "/#community-stats" },
  { label: "FAQ", href: "/#faq" },
  { label: "Admin Dashboard", href: "/admin" },
];

const ACCOUNT_LINKS = [
  { label: "Login", href: "/login" },
  { label: "Get Started", href: "/register" },
];

export function Footer() {
  return (
    <footer className="bg-[#142D3B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              One Campus. One Community. Every Belonging Matters. Helping
              students, faculty, and staff reunite with lost essentials faster
              and more reliably.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-[#C9FD04]" />
              Campus Network Active
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Platform
              </h3>
              <ul className="mt-4 space-y-3">
                {PLATFORM_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-[#C9FD04]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Resources
              </h3>
              <ul className="mt-4 space-y-3">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-[#C9FD04]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Account
              </h3>
              <ul className="mt-4 space-y-3">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-[#C9FD04]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>&copy; 2026 Findora Campus Lost &amp; Found. All rights reserved.</p>
          <p>Built for connected university communities.</p>
        </div>
      </div>
    </footer>
  );
}

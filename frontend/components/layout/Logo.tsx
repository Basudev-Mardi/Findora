import Link from "next/link";
import { Compass } from "lucide-react";

interface LogoProps {
  variant?: "dark" | "light";
}

export function Logo({ variant = "dark" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 group focus:outline-none"
      aria-label="Findora Home"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          isLight
            ? "bg-[#C9FD04] text-[#142D3B]"
            : "bg-[#142D3B] text-[#C9FD04]"
        }`}
      >
        <Compass className="h-5 w-5 stroke-[2.25]" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-[1.125rem] font-bold tracking-tight ${
            isLight ? "text-white" : "text-[#142D3B]"
          }`}
        >
          Findora
        </span>
        <span
          className={`text-[10px] font-medium uppercase tracking-[0.14em] mt-0.5 ${
            isLight ? "text-white/60" : "text-[#7B858B]"
          }`}
        >
          Campus Lost &amp; Found
        </span>
      </span>
    </Link>
  );
}

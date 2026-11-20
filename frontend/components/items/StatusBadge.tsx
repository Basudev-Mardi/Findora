import type { ItemLifecycleState } from "@/types/item";

interface StatusBadgeProps {
  status: ItemLifecycleState;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<
  ItemLifecycleState,
  { label: string; className: string; dotClass: string }
> = {
  available: {
    label: "Available",
    className: "bg-[#1F6B50]/10 text-[#1F6B50] border border-[#1F6B50]/20",
    dotClass: "bg-[#1F6B50]",
  },
  claim_requested: {
    label: "Claim Requested",
    className: "bg-amber-500/12 text-amber-800 border border-amber-500/25",
    dotClass: "bg-amber-500",
  },
  under_verification: {
    label: "Under Verification",
    className: "bg-sky-500/12 text-sky-800 border border-sky-500/25",
    dotClass: "bg-sky-500",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-600/12 text-emerald-800 border border-emerald-600/25",
    dotClass: "bg-emerald-600",
  },
  recovered: {
    label: "Recovered",
    className: "bg-[#142D3B] text-white border border-[#142D3B]",
    dotClass: "bg-[#C9FD04]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-700 border border-red-500/20",
    dotClass: "bg-red-500",
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.available;
  const padding = size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

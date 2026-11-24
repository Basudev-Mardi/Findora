import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, ShieldCheck } from "lucide-react";
import type { LostFoundItem } from "@/types/item";
import { StatusBadge } from "./StatusBadge";

interface CatalogItemCardProps {
  item: LostFoundItem;
  detailBasePath?: string;
  detailQuery?: string;
}

export function CatalogItemCard({
  item,
  detailBasePath = "/items",
  detailQuery,
}: CatalogItemCardProps) {
  const isFound = item.status === "found";
  const isRecovered = item.lifecycleState === "recovered";
  const baseHref = `${detailBasePath}/${item.id}`;
  const detailHref = detailQuery ? `${baseHref}?${detailQuery}` : baseHref;
  const claimParams = new URLSearchParams(detailQuery ?? "");
  claimParams.set("action", "claim");
  const actionHref =
    isFound && !isRecovered ? `${baseHref}?${claimParams.toString()}` : detailHref;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white shadow-[0_1px_2px_rgba(20,45,59,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#142D3B]/20 hover:shadow-[0_16px_32px_rgba(20,45,59,0.08)]">
      <Link
        href={detailHref}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECEFE9]"
      >
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          unoptimized={item.image.startsWith("data:")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md ${
              isFound
                ? "bg-[#1F6B50]/90 text-white"
                : "bg-[#142D3B]/90 text-[#C9FD04]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9FD04]" />
            {isFound ? "Found" : "Lost"}
          </span>

          <span className="rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-medium text-[#202B32] backdrop-blur-md">
            {item.category}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={detailHref} className="min-w-0">
            <h3 className="text-base font-bold leading-snug text-[#142D3B] transition-colors group-hover:text-[#1F6B50]">
              {item.title}
            </h3>
          </Link>
        </div>

        <div className="mt-2">
          <StatusBadge status={item.lifecycleState} size="sm" />
        </div>

        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#7B858B]">
          {item.shortDescription}
        </p>

        <div className="mt-4 space-y-2 border-t border-[#E7EBE8] pt-3.5 text-xs text-[#7B858B]">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1F6B50]" />
            <span className="truncate" title={item.location}>
              {item.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#7B858B]" />
            <span>
              {isFound ? "Found" : "Reported"} {item.date}
            </span>
          </div>
        </div>

        <div className="mt-5 pt-1">
          <Link
            href={actionHref}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
              isFound && !isRecovered
                ? "bg-[#1F6B50] text-white hover:bg-[#142D3B]"
                : "border border-[#E7EBE8] bg-[#F7F8F5] text-[#142D3B] hover:border-[#142D3B] hover:bg-[#142D3B] hover:text-white"
            }`}
          >
            {isFound && !isRecovered ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Request Claim
              </>
            ) : (
              <>
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}

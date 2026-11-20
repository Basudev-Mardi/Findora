import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import type { LostFoundItem } from "@/types/item";

interface ItemCardProps {
  item: LostFoundItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const isFound = item.status === "found";
  const href = `/items/${item.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white shadow-[0_1px_2px_rgba(20,45,59,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#142D3B]/20 hover:shadow-[0_14px_30px_rgba(20,45,59,0.08)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECEFE9]">
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
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md ${
              isFound
                ? "bg-[#1F6B50]/90 text-white"
                : "bg-[#142D3B]/90 text-[#C9FD04]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isFound ? "bg-[#C9FD04]" : "bg-[#C9FD04]"
              }`}
            />
            {isFound ? "Found" : "Lost"}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#202B32] backdrop-blur-md">
            {item.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-[#142D3B] transition-colors group-hover:text-[#1F6B50]">
            {item.title}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#7B858B] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1F6B50]" />
        </div>

        <div className="mt-4 space-y-2 border-t border-[#E7EBE8] pt-3.5 text-xs text-[#7B858B]">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1F6B50]" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#7B858B]" />
            <span>{item.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

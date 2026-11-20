import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LostFoundItem } from "@/types/item";
import { ItemCard } from "@/components/items/ItemCard";

interface ItemsShowcaseSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  items: LostFoundItem[];
  viewAllHref: string;
  viewAllLabel: string;
}

export function ItemsShowcaseSection({
  eyebrow,
  title,
  description,
  items,
  viewAllHref,
  viewAllLabel,
}: ItemsShowcaseSectionProps) {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#142D3B] sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7B858B] sm:text-base">
              {description}
            </p>
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#E7EBE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#142D3B] transition-all hover:border-[#142D3B]/30 hover:bg-[#142D3B] hover:text-white sm:self-auto"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

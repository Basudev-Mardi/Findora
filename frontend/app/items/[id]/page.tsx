import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ItemDetailView } from "@/components/items/ItemDetailView";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
}

export const metadata: Metadata = {
  title: "Item Details — Findora",
  description:
    "View details, campus location, and claim or contact options for a Findora campus listing.",
};

async function ItemDetailLoader({ params, searchParams }: ItemDetailPageProps) {
  const { id } = await params;
  const { action } = await searchParams;
  return <ItemDetailView id={id} initialAction={action} />;
}

export default function ItemDetailPage(props: ItemDetailPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="h-[460px] animate-pulse rounded-3xl border border-[#E7EBE8] bg-white" />
            </div>
          }
        >
          <ItemDetailLoader {...props} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

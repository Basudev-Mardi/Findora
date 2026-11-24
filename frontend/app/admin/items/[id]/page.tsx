import { Suspense } from "react";
import type { Metadata } from "next";
import { ItemDetailView } from "@/components/items/ItemDetailView";

interface AdminItemDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string; from?: string }>;
}

export const metadata: Metadata = {
  title: "Item Details — Admin Dashboard — Findora",
  description:
    "View item details, campus location, and claim activity inside the Findora Admin Dashboard.",
};

async function AdminItemDetailLoader({
  params,
  searchParams,
}: AdminItemDetailPageProps) {
  const { id } = await params;
  const { action, from } = await searchParams;
  return (
    <ItemDetailView
      id={id}
      initialAction={action}
      adminContext={{ from }}
    />
  );
}

export default function AdminItemDetailPage(props: AdminItemDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl">
          <div className="h-[460px] animate-pulse rounded-3xl border border-[#E7EBE8] bg-white" />
        </div>
      }
    >
      <AdminItemDetailLoader {...props} />
    </Suspense>
  );
}

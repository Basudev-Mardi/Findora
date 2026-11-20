import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ItemsCatalogView } from "@/components/items/ItemsCatalogView";

export const metadata: Metadata = {
  title: "Found Items — Findora",
  description:
    "Explore items found across campus and verify ownership to claim your belongings safely.",
};

export default function FoundItemsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex-1">
        <ItemsCatalogView
          status="found"
          eyebrow="Campus Found Feed"
          title="Found Items"
          description="Belongings turned in or spotted by fellow campus members. Select an item to verify ownership and coordinate a secure campus handoff."
        />
      </main>
      <Footer />
    </div>
  );
}

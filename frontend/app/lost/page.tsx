import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ItemsCatalogView } from "@/components/items/ItemsCatalogView";

export const metadata: Metadata = {
  title: "Lost Items — Findora",
  description:
    "Browse recently reported lost belongings across campus and help reunite items with their owners.",
};

export default function LostItemsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex-1">
        <ItemsCatalogView
          status="lost"
          eyebrow="Campus Lost Feed"
          title="Lost Items"
          description="Browse items recently misplaced across libraries, lecture halls, and campus walkways. Spotted something familiar? Open the listing to connect safely."
        />
      </main>
      <Footer />
    </div>
  );
}

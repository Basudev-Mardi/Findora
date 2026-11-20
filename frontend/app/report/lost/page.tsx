import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReportItemForm } from "@/components/report/ReportItemForm";

export const metadata: Metadata = {
  title: "Report Lost Item — Findora",
  description:
    "Submit a lost item report on Findora to alert your campus community and recover misplaced belongings faster.",
};

export default function ReportLostItemPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex-1">
        <ReportItemForm type="lost" />
      </main>
      <Footer />
    </div>
  );
}

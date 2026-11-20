import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReportItemForm } from "@/components/report/ReportItemForm";

export const metadata: Metadata = {
  title: "Report Found Item — Findora",
  description:
    "Log a found campus item on Findora with built-in privacy safeguards so the rightful owner can verify and claim it.",
};

export default function ReportFoundItemPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex-1">
        <ReportItemForm type="found" />
      </main>
      <Footer />
    </div>
  );
}

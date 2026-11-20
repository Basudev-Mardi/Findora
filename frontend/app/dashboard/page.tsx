import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserDashboardView } from "@/components/dashboard/UserDashboardView";

export const metadata: Metadata = {
  title: "User Dashboard — Findora",
  description:
    "Track your lost and found reports, active claims, and campus recovery status.",
};

export default function UserDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F5]">
      <Navbar />
      <main className="flex-1">
        <UserDashboardView />
      </main>
      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin/AdminAuthContext";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin Dashboard — Findora",
  description:
    "Authorized campus administration dashboard for managing lost/found items, claims, and verified recoveries.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}

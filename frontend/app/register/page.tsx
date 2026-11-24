import type { Metadata } from "next";
import { StudentRegisterView } from "@/components/auth/StudentRegisterView";

export const metadata: Metadata = {
  title: "Create Student Account — Findora",
  description:
    "Create your Findora campus student account to report or claim lost items.",
};

export default function RegisterPage() {
  return <StudentRegisterView />;
}

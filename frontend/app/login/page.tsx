import type { Metadata } from "next";
import { StudentLoginView } from "@/components/auth/StudentLoginView";

export const metadata: Metadata = {
  title: "Student Login — Findora",
  description:
    "Sign in with your campus account to access Findora lost & found.",
};

export default function LoginPage() {
  return <StudentLoginView />;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStudentAuth } from "./StudentAuthContext";

function isPublicAuthExemptPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin")
  );
}

export function StudentRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isCheckingSession } = useStudentAuth();

  const isExempt = isPublicAuthExemptPath(pathname);

  useEffect(() => {
    if (!isExempt && !isCheckingSession && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isExempt, isCheckingSession, isAuthenticated, router]);

  if (isExempt) {
    return <>{children}</>;
  }

  if (isCheckingSession || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F5] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E7EBE8] bg-white px-6 py-4 text-sm font-medium text-[#142D3B] shadow-[0_8px_24px_rgba(20,45,59,0.06)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#1F6B50]" />
          {isCheckingSession
            ? "Checking student session..."
            : "Redirecting to student login..."}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

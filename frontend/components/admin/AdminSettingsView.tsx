"use client";

import { useEffect, useState } from "react";
import { Database, Lock, LogOut, ShieldCheck } from "lucide-react";
import { apiClient } from "@/services/api";
import { env } from "@/config/env";
import type { HealthStatus } from "@/types/api";
import { useAdminAuth } from "./AdminAuthContext";

export function AdminSettingsView() {
  const { signOut } = useAdminAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    apiClient
      .health()
      .then((res) => setHealth(res.data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#142D3B]">
          Administration Settings
        </h2>
        <p className="mt-1 text-sm text-[#7B858B]">
          System configuration, backend connection mode, and session security.
        </p>
      </div>

      <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-[#142D3B]">
          <Database className="h-4 w-4 text-[#1F6B50]" />
          Backend &amp; Storage Status
        </div>
        <dl className="grid grid-cols-1 gap-4 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] p-4 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-wider text-[#7B858B]">
              API Base URL
            </dt>
            <dd className="mt-1 font-mono font-semibold text-[#142D3B]">
              {env.apiUrl}
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wider text-[#7B858B]">
              Active Data Mode
            </dt>
            <dd className="mt-1 font-semibold text-[#1F6B50]">
              {health ? `${health.mode.toUpperCase()} (${health.status})` : "Checking..."}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-[#142D3B]">
          <ShieldCheck className="h-4 w-4 text-[#1F6B50]" />
          Authentication Mode
        </div>
        <p className="text-sm leading-relaxed text-[#7B858B]">
          This console is running in{" "}
          <strong className="text-[#142D3B]">
            Demo Administrator Authentication Mode
          </strong>
          . Every privileged request (item updates, item deletion, private claim
          review, approval/rejection, and physical handover confirmation) is
          independently verified by Express middleware via{" "}
          <code className="rounded bg-[#F7F8F5] px-1.5 py-0.5 font-mono text-xs text-[#142D3B]">
            x-admin-key
          </code>
          .
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EBE8] pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B858B]">
            <Lock className="h-3.5 w-3.5 text-[#1F6B50]" />
            Session stored in browser sessionStorage only
          </span>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            Lock Console &amp; Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

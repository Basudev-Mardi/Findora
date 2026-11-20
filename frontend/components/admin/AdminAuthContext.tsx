"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { claimsService } from "@/services/claimsService";

const SESSION_KEY = "findora_demo_admin_key";

interface AdminAuthContextValue {
  adminKey: string | null;
  isAuthorized: boolean;
  isCheckingSession: boolean;
  isAuthorizing: boolean;
  authError: string | null;
  authorize: (key: string) => Promise<boolean>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore and re-verify stored session key against the backend on mount.
  useEffect(() => {
    const controller = new AbortController();

    async function verifyStoredSession() {
      const savedKey =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(SESSION_KEY)
          : null;

      if (!savedKey) {
        setIsCheckingSession(false);
        return;
      }

      try {
        await claimsService.listForAdmin(savedKey, "all", controller.signal);
        if (!controller.signal.aborted) {
          setAdminKey(savedKey);
        }
      } catch {
        if (!controller.signal.aborted) {
          window.sessionStorage.removeItem(SESSION_KEY);
          setAdminKey(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingSession(false);
        }
      }
    }

    void verifyStoredSession();
    return () => controller.abort();
  }, []);

  const authorize = useCallback(async (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) {
      setAuthError("Please enter an administrator key.");
      return false;
    }

    setIsAuthorizing(true);
    setAuthError(null);

    try {
      await claimsService.listForAdmin(trimmed, "all");
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SESSION_KEY, trimmed);
      }
      setAdminKey(trimmed);
      return true;
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Administrator authorization failed."
      );
      return false;
    } finally {
      setIsAuthorizing(false);
    }
  }, []);

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    setAdminKey(null);
    setAuthError(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminKey,
        isAuthorized: Boolean(adminKey),
        isCheckingSession,
        isAuthorizing,
        authError,
        authorize,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }
  return ctx;
}

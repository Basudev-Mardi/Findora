"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

const STUDENT_SESSION_KEY = "findora_student_session";
const DEMO_USER_STORAGE_KEY = "findora_active_demo_user_id";

export interface StudentSession {
  userId: string;
  name: string;
  email: string;
}

export const DEMO_STUDENTS: StudentSession[] = [
  {
    userId: "usr-demo-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@university.edu",
  },
  {
    userId: "usr-demo-2",
    name: "Maya Lin",
    email: "maya.lin@university.edu",
  },
  {
    userId: "usr-demo-empty",
    name: "New Student",
    email: "student@university.edu",
  },
];

interface StudentAuthContextValue {
  student: StudentSession | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (session: StudentSession) => void;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextValue | null>(null);

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSession: StudentSession | null = null;

function emitSessionChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeSession(callback: () => void) {
  listeners.add(callback);
  const handleStorage = () => emitSessionChange();
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getClientSnapshot(): StudentSession | null {
  try {
    const raw = window.sessionStorage.getItem(STUDENT_SESSION_KEY);
    if (raw === cachedRaw) {
      return cachedSession;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedSession = null;
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<StudentSession>;
    if (parsed.userId && parsed.name && parsed.email) {
      cachedSession = {
        userId: parsed.userId,
        name: parsed.name,
        email: parsed.email,
      };
      return cachedSession;
    }
    window.sessionStorage.removeItem(STUDENT_SESSION_KEY);
    cachedRaw = null;
    cachedSession = null;
    return null;
  } catch {
    cachedRaw = null;
    cachedSession = null;
    return null;
  }
}

const SERVER_UNRESOLVED = Symbol("SERVER_UNRESOLVED");
type SessionSnapshot = StudentSession | null | typeof SERVER_UNRESOLVED;

function getServerSnapshot(): SessionSnapshot {
  return SERVER_UNRESOLVED;
}

export function StudentAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshot = useSyncExternalStore<SessionSnapshot>(
    subscribeSession,
    getClientSnapshot,
    getServerSnapshot
  );

  const isCheckingSession = snapshot === SERVER_UNRESOLVED;
  const student = snapshot === SERVER_UNRESOLVED ? null : snapshot;

  const login = useCallback((session: StudentSession) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        STUDENT_SESSION_KEY,
        JSON.stringify(session)
      );
      window.localStorage.setItem(DEMO_USER_STORAGE_KEY, session.userId);
      emitSessionChange();
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STUDENT_SESSION_KEY);
      emitSessionChange();
    }
  }, []);

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isAuthenticated: Boolean(student),
        isCheckingSession,
        login,
        logout,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) {
    throw new Error("useStudentAuth must be used inside StudentAuthProvider.");
  }
  return ctx;
}

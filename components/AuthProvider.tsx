"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { apiFetch } from "@/lib/api";
import {
  clearSession,
  getSession,
  landingPathFor,
  setSession,
  type Session,
} from "@/lib/auth";
import type { AuthResponse, RegisterableRole } from "@/types";

/**
 * The cookie is an external store: read it through useSyncExternalStore rather
 * than mirroring it into state, so every consumer re-renders on login/logout
 * and nothing has to be synced from an effect.
 */
let cachedSession: Session | null | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readSession(): Session | null {
  if (cachedSession === undefined) cachedSession = getSession();
  return cachedSession;
}

/** Cookies aren't readable while rendering on the server. */
function noSession(): null {
  return null;
}

function publish(next: Session | null) {
  cachedSession = next;
  for (const listener of listeners) listener();
}

// `ready` flips to true once hydration is done and readSession() is trustworthy.
const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

interface AuthContextValue {
  user: Session | null;
  /** False until the cookie has been read on the client — avoids a nav flash. */
  ready: boolean;
  login: (email: string, password: string) => Promise<Session>;
  register: (
    fullName: string,
    email: string,
    password: string,
    role: RegisterableRole,
  ) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useSyncExternalStore(subscribe, readSession, noSession);
  const ready = useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);

  const authenticate = useCallback(
    async (path: "/auth/login" | "/auth/register", body: unknown) => {
      const auth = await apiFetch<AuthResponse>(path, { method: "POST", body });
      const session = setSession(auth);
      publish(session);
      router.push(landingPathFor(session.role));
      router.refresh();
      return session;
    },
    [router],
  );

  const login = useCallback(
    (email: string, password: string) =>
      authenticate("/auth/login", { email, password }),
    [authenticate],
  );

  const register = useCallback(
    (
      fullName: string,
      email: string,
      password: string,
      role: RegisterableRole,
    ) => authenticate("/auth/register", { fullName, email, password, role }),
    [authenticate],
  );

  const logout = useCallback(() => {
    clearSession();
    publish(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

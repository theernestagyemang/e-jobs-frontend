import Cookies from "js-cookie";

import type { AuthResponse, Role } from "@/types";

/**
 * Single JSON cookie holding the whole session. `middleware.ts` parses the same
 * cookie in the Edge runtime — keep the name and shape in sync with it.
 */
export const SESSION_COOKIE = "ejobs_session";

/** Days the cookie lives for. The backend JWT has its own, separate expiry. */
const SESSION_DAYS = 1;

export interface Session {
  token: string;
  email: string;
  role: Role;
  fullName: string;
}

export function setSession(auth: AuthResponse): Session {
  const session: Session = {
    token: auth.token,
    email: auth.email,
    role: auth.role,
    fullName: auth.fullName,
  };

  Cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    expires: SESSION_DAYS,
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  });

  return session;
}

/** Returns null when the cookie is absent, malformed, or missing a field. */
export function getSession(): Session | null {
  const raw = Cookies.get(SESSION_COOKIE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.token || !parsed.email || !parsed.role || !parsed.fullName) {
      return null;
    }
    return parsed as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  Cookies.remove(SESSION_COOKIE, { path: "/" });
}

/** Where a user lands after logging in or registering. */
export function landingPathFor(role: Role) {
  switch (role) {
    case "EMPLOYER":
      return "/employer/jobs";
    case "ADMIN":
      return "/admin/stats";
    case "JOB_SEEKER":
    default:
      return "/jobs";
  }
}

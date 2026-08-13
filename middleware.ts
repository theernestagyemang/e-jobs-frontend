import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-runtime route guard. It cannot import lib/auth.ts (js-cookie is browser
 * code), so the cookie name and JSON shape are duplicated here — keep both in
 * sync. This is a UX guard only: the backend re-checks every role on its side.
 */
const SESSION_COOKIE = "ejobs_session";

type Role = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

const REQUIRED_ROLE: Array<{ prefix: string; role: Role }> = [
  { prefix: "/employer", role: "EMPLOYER" },
  { prefix: "/seeker", role: "JOB_SEEKER" },
  { prefix: "/admin", role: "ADMIN" },
];

/**
 * Where each role belongs. Mirrors landingPathFor() in lib/auth.ts — that
 * module can't be imported here, so keep the two in sync.
 */
const LANDING: Record<Role, string> = {
  EMPLOYER: "/employer/jobs",
  JOB_SEEKER: "/jobs",
  ADMIN: "/admin/stats",
};

function readRole(request: NextRequest): Role | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  for (const candidate of [raw, safeDecode(raw)]) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as { role?: Role; token?: string };
      if (parsed.token && parsed.role) return parsed.role;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

/** js-cookie percent-encodes the JSON, so a raw cookie may still be encoded. */
function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guard = REQUIRED_ROLE.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!guard) return NextResponse.next();

  const role = readRole(request);
  if (role === guard.role) return NextResponse.next();

  const destination = request.nextUrl.clone();
  // A signed-in user on someone else's route is authenticated but not
  // authorized — sending them to /login would read as being signed out, so
  // they go to their own landing page instead. No session (or an unreadable
  // one) still means /login.
  destination.pathname = role ? LANDING[role] : "/login";
  destination.search = "";
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/employer/:path*", "/seeker/:path*", "/admin/:path*"],
};

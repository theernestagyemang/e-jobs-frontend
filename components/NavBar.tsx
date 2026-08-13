"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import type { Role } from "@/types";

/** Derived from Link itself so it satisfies typed routes. */
type Href = React.ComponentProps<typeof Link>["href"];

interface NavLink {
  href: Href;
  label: string;
}

const BROWSE: NavLink = { href: "/jobs", label: "Browse Jobs" };

const ROLE_LINKS: Record<Role, NavLink[]> = {
  EMPLOYER: [
    { href: "/employer/jobs", label: "My Jobs" },
    { href: "/employer/applications", label: "Applications" },
  ],
  JOB_SEEKER: [{ href: "/seeker/applications", label: "My Applications" }],
  ADMIN: [
    { href: "/admin/stats", label: "Stats" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/admins", label: "Admins" },
    { href: "/admin/audit-logs", label: "Audit Logs" },
  ],
};

export default function NavBar() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();

  const links = [BROWSE, ...(user ? ROLE_LINKS[user.role] : [])];

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold whitespace-nowrap text-slate-900"
        >
          e-<span className="text-indigo-600">JOBS</span>
        </Link>

        {/* Scrolls rather than wrapping when the role links don't fit. */}
        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const href = String(link.href);
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={link.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Hidden until the cookie is read, so the logged-in state doesn't flash. */}
        {!ready ? null : user ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              {user.fullName}
            </span>
            <button type="button" onClick={logout} className={btnSecondary}>
              Log out
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className={btnSecondary}>
              Log in
            </Link>
            <Link href="/register" className={btnPrimary}>
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

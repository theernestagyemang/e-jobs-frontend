import Link from "next/link";

import HeroSearch from "@/components/HeroSearch";
import { humanize } from "@/components/StatusBadge";
import { API_URL } from "@/lib/api";
import type { JobSummaryResponse, PagedResponse } from "@/types";

export const dynamic = "force-dynamic";

/**
 * One public call powers the whole page: the total comes from the envelope,
 * the rest is derived from the roles we already have in hand.
 */
async function getBoard(): Promise<PagedResponse<JobSummaryResponse> | null> {
  try {
    const response = await fetch(`${API_URL}/jobs?page=0&size=100`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as PagedResponse<JobSummaryResponse>;
  } catch {
    return null;
  }
}

const SEEKER_STEPS = [
  {
    title: "Search without an account",
    body: "Every active posting is public. Filter by keyword, location or employment type before you commit to anything.",
  },
  {
    title: "Apply in a minute",
    body: "One cover note, one link to your resume. No forms that ask you to retype what your CV already says.",
  },
  {
    title: "Watch it move",
    body: "Submitted, under review, shortlisted — your dashboard shows the real status the employer set, not a guess.",
  },
];

const EMPLOYER_STEPS = [
  {
    title: "Draft it privately",
    body: "New postings start as drafts. Nobody sees them until you publish, so you can get the wording right first.",
  },
  {
    title: "Publish when ready",
    body: "Activate to put it on the public board. Close it the moment you have enough applicants.",
  },
  {
    title: "Run the pipeline",
    body: "Every applicant across every posting in one list, moving through review and shortlisting as you decide.",
  },
];

export default async function HomePage() {
  const board = await getBoard();
  const roles = board?.content ?? [];
  const total = board?.page.totalElements ?? 0;
  const featured = roles.slice(0, 6);
  const employers = new Set(roles.map((role) => role.employerName)).size;
  const remote = roles.filter((role) => role.employmentType === "REMOTE").length;

  const stats = [
    { value: total, label: total === 1 ? "open role" : "open roles" },
    { value: employers, label: employers === 1 ? "employer hiring" : "employers hiring" },
    { value: remote, label: "open to remote" },
  ];

  return (
    <div className="flex flex-col">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <p className="rise inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {total > 0
              ? `${total} role${total === 1 ? "" : "s"} accepting applications right now`
              : "A hiring platform for employers and job seekers"}
          </p>

          <h1
            className="rise mt-6 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Find work worth doing.
            <br />
            <span className="text-indigo-600">Or find who does it.</span>
          </h1>

          <p
            className="rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
            style={{ animationDelay: "120ms" }}
          >
            Browse every open role without an account, apply with a single note,
            and follow exactly where your application stands.
          </p>

          <div
            className="rise mx-auto mt-10 max-w-3xl"
            style={{ animationDelay: "180ms" }}
          >
            <HeroSearch />
          </div>

          <dl
            className="rise mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
            style={{ animationDelay: "240ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums text-slate-900">
                  {stat.value}
                </dd>
                <dd className="text-xs uppercase tracking-wide text-slate-400">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------- featured */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Latest postings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The most recently published roles on the board.
            </p>
          </div>
          {total > 0 && (
            <Link
              href="/jobs"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Browse all {total} roles →
            </Link>
          )}
        </div>

        {featured.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">
              {board
                ? "No roles have been published yet."
                : "The job service isn't reachable right now."}
            </p>
            <Link
              href="/register"
              className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Post the first one
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((role) => (
              <li key={role.id}>
                <Link
                  href={`/jobs/${role.id}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {humanize(role.employmentType)}
                  </span>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">
                    {role.title}
                  </h3>
                  <p className="text-sm text-slate-600">{role.employerName}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span>{role.location}</span>
                    <span>{role.salaryRange || "Salary on request"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------ how it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            Two sides, one board
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            The same postings, seen from whichever side of the hire you&apos;re on.
          </p>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
            {[
              { who: "For job seekers", steps: SEEKER_STEPS, cta: "/jobs", ctaLabel: "Start browsing" },
              { who: "For employers", steps: EMPLOYER_STEPS, cta: "/register", ctaLabel: "Post a role" },
            ].map((track) => (
              <div key={track.who} className="flex flex-col">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {track.who}
                </h3>
                <ol className="mt-6 flex flex-1 flex-col gap-6">
                  {track.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold tabular-nums text-slate-500">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-slate-900">{step.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  href={track.cta}
                  className="mt-8 inline-flex w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {track.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Hiring for something?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300">
              Draft the posting privately, publish it when it reads right, and
              run every applicant through one pipeline.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                Create an employer account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
              >
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            e-<span className="text-indigo-600">JOBS</span>
          </span>
          <nav className="flex flex-wrap gap-6">
            <Link href="/jobs" className="hover:text-slate-900">
              Browse jobs
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Log in
            </Link>
            <Link href="/register" className="hover:text-slate-900">
              Register
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

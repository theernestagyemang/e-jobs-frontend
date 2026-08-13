"use client";

import { card, errorBanner, pageTitle } from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { PlatformStatsResponse } from "@/types";

const TILES: Array<{
  key: keyof PlatformStatsResponse;
  label: string;
  hint: string;
}> = [
  { key: "totalUsers", label: "Total users", hint: "All accounts" },
  { key: "totalEmployers", label: "Employers", hint: "Publishing jobs" },
  { key: "totalJobSeekers", label: "Job seekers", hint: "Applying to jobs" },
  { key: "totalJobs", label: "Job postings", hint: "Every status" },
  { key: "activeJobs", label: "Active jobs", hint: "Accepting applications" },
  { key: "totalApplications", label: "Applications", hint: "Submitted overall" },
];

export default function AdminStatsPage() {
  const { data, loading, error } =
    useResource<PlatformStatsResponse>("/admin/stats");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className={pageTitle}>Platform overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          User, job and application counts across e-JOBS.
        </p>
      </div>

      {error && (
        <div className={`${errorBanner} mb-4`} role="alert">
          {error}
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <div key={tile.key} className={`${card} p-6`}>
            <dt className="text-sm font-medium text-slate-500">{tile.label}</dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
              {loading || !data ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-100" />
              ) : (
                data[tile.key].toLocaleString()
              )}
            </dd>
            <p className="mt-1 text-xs text-slate-400">{tile.hint}</p>
          </div>
        ))}
      </dl>
    </div>
  );
}

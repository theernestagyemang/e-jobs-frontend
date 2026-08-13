import Link from "next/link";

import JobSearchBar from "@/components/JobSearchBar";
import { JobStatusBadge, humanize } from "@/components/StatusBadge";
import { API_URL } from "@/lib/api";
import { btnSecondary, card, errorBanner, pageTitle } from "@/lib/ui";
import type { JobSummaryResponse, PagedResponse } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * Server-side fetch: /jobs is public, so no token is involved. Uses fetch
 * directly rather than apiFetch (that wrapper is for the browser).
 */
async function searchJobs(params: URLSearchParams) {
  const response = await fetch(`${API_URL}/jobs?${params.toString()}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Job search failed (${response.status})`);
  }
  return (await response.json()) as PagedResponse<JobSummaryResponse>;
}

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const query = await searchParams;
  const keyword = first(query.keyword);
  const location = first(query.location);
  const employmentType = first(query.employmentType);
  const pageIndex = Math.max(0, Number.parseInt(first(query.page), 10) || 0);

  const apiParams = new URLSearchParams();
  if (keyword) apiParams.set("keyword", keyword);
  if (location) apiParams.set("location", location);
  // The backend calls this filter `type`; the URL keeps the fuller name.
  if (employmentType) apiParams.set("type", employmentType);
  apiParams.set("page", String(pageIndex));
  apiParams.set("size", String(PAGE_SIZE));

  let result: PagedResponse<JobSummaryResponse> | null = null;
  let error: string | null = null;
  try {
    result = await searchJobs(apiParams);
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Could not reach the jobs service.";
  }

  const jobs = result?.content ?? [];
  const totalPages = result?.page.totalPages ?? 0;

  function pageHref(next: number) {
    const linkParams = new URLSearchParams();
    if (keyword) linkParams.set("keyword", keyword);
    if (location) linkParams.set("location", location);
    if (employmentType) linkParams.set("employmentType", employmentType);
    if (next > 0) linkParams.set("page", String(next));
    const search = linkParams.toString();
    return search ? `/jobs?${search}` : "/jobs";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className={pageTitle}>Open roles</h1>
        <p className="mt-1 text-sm text-slate-500">
          {result
            ? `${result.page.totalElements} posting${result.page.totalElements === 1 ? "" : "s"} matching your search`
            : "Browse every active posting on the platform."}
        </p>
      </div>

      <JobSearchBar initial={{ keyword, location, employmentType }} />

      {error && (
        <div className={`${errorBanner} mt-6`} role="alert">
          {error}
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className={`${card} mt-6 p-10 text-center text-sm text-slate-500`}>
          No jobs match those filters yet.
        </div>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className={`${card} flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-900">{job.title}</h2>
                <JobStatusBadge status={job.status} />
              </div>

              <p className="text-sm text-slate-600">{job.employerName}</p>

              <dl className="mt-auto space-y-1 text-sm text-slate-500">
                <div className="flex gap-2">
                  <dt className="sr-only">Location</dt>
                  <dd>{job.location}</dd>
                  <dd className="text-slate-300">•</dd>
                  <dd>{humanize(job.employmentType)}</dd>
                </div>
                {job.salaryRange && <div>{job.salaryRange}</div>}
                <div className="text-xs">
                  Apply by {new Date(job.deadline).toLocaleDateString()}
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          {pageIndex > 0 ? (
            <Link href={pageHref(pageIndex - 1)} className={btnSecondary}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-slate-500">
            Page {pageIndex + 1} of {totalPages}
          </span>
          {pageIndex + 1 < totalPages ? (
            <Link href={pageHref(pageIndex + 1)} className={btnSecondary}>
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}

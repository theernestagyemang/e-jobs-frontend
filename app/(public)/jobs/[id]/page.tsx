import Link from "next/link";
import { notFound } from "next/navigation";

import ApplyButton from "@/components/ApplyButton";
import { JobStatusBadge, humanize } from "@/components/StatusBadge";
import { API_URL } from "@/lib/api";
import { card, pageTitle } from "@/lib/ui";
import type { JobResponse } from "@/types";

export const dynamic = "force-dynamic";

async function getJob(id: string): Promise<JobResponse | null> {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  // A DRAFT owned by someone else also comes back as 404, by design.
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Could not load this job (${response.status})`);
  }
  return (await response.json()) as JobResponse;
}

export default async function JobDetailPage({
  params,
}: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) notFound();

  const facts: Array<[string, string]> = [
    ["Employer", job.employerName],
    ["Location", job.location],
    ["Employment type", humanize(job.employmentType)],
    ["Department", job.department || "—"],
    ["Salary range", job.salaryRange || "Not disclosed"],
    ["Application deadline", new Date(job.deadline).toLocaleDateString()],
    ["Posted", new Date(job.createdAt).toLocaleDateString()],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/jobs"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to all jobs
      </Link>

      <div className={`${card} mt-4 p-8`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className={pageTitle}>{job.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {job.employerName} · {job.location}
            </p>
          </div>
          <JobStatusBadge status={job.status} />
        </div>

        <dl className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          {facts.map(([term, value]) => (
            <div key={term}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {term}
              </dt>
              <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-semibold text-slate-900">
            About this role
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {job.description}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {job.status === "ACTIVE" ? (
          <ApplyButton jobId={job.id} />
        ) : (
          <p className="text-sm text-slate-500">
            This posting is {humanize(job.status).toLowerCase()} and is not
            accepting applications.
          </p>
        )}
      </div>
    </div>
  );
}

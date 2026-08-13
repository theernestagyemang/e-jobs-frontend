"use client";

import Link from "next/link";
import { useState } from "react";

import { ApplicationStatusBadge, humanize } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import { card, errorBanner, input, pageTitle } from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { ApplicationResponse, ApplicationStatus } from "@/types";

/**
 * Mirrors the backend's transition guard: SUBMITTED -> UNDER_REVIEW ->
 * SHORTLISTED, plus REJECTED from any state that isn't already REJECTED.
 */
const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["REJECTED"],
  REJECTED: [],
};

export default function EmployerApplicationsPage() {
  const { data, setData, loading, error, token } = useResource<
    ApplicationResponse[]
  >("/employer/applications");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const applications = data ?? [];

  async function changeStatus(
    application: ApplicationResponse,
    status: ApplicationStatus,
  ) {
    setBusyId(application.id);
    setActionError(null);
    try {
      const updated = await apiFetch<ApplicationResponse>(
        `/applications/${application.id}/status`,
        { method: "PATCH", body: { status }, token },
      );
      setData((current) =>
        (current ?? []).map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : "Could not update this application.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className={pageTitle}>Applicant pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every application across your postings.
        </p>
      </div>

      {(error || actionError) && (
        <div className={`${errorBanner} mb-4`} role="alert">
          {actionError ?? error}
        </div>
      )}

      {loading && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          Loading the pipeline…
        </div>
      )}

      {!loading && applications.length === 0 && !error && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          No one has applied to your postings yet.
        </div>
      )}

      <ul className="space-y-4">
        {applications.map((application) => {
          const options = NEXT_STATUSES[application.status];
          return (
            <li key={application.id} className={`${card} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900">
                    {application.applicantName}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Applied to{" "}
                    <Link
                      href={`/jobs/${application.jobId}`}
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {application.jobTitle}
                    </Link>{" "}
                    on {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <ApplicationStatusBadge status={application.status} />
                  {options.length > 0 ? (
                    <select
                      className={`${input} w-auto`}
                      value=""
                      disabled={busyId === application.id}
                      aria-label={`Move ${application.applicantName} to a new status`}
                      onChange={(event) => {
                        const next = event.target.value as ApplicationStatus;
                        if (next) changeStatus(application, next);
                      }}
                    >
                      <option value="">Move to…</option>
                      {options.map((status) => (
                        <option key={status} value={status}>
                          {humanize(status)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-400">Final state</span>
                  )}
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
                {application.coverNote}
              </p>

              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View resume →
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

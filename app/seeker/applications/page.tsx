"use client";

import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/StatusBadge";
import { btnPrimary, card, errorBanner, pageTitle, td, th } from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { ApplicationResponse } from "@/types";

/** FR-APP-05: read-only status tracking for the signed-in job seeker. */
export default function SeekerApplicationsPage() {
  const { data, loading, error } = useResource<ApplicationResponse[]>(
    "/applicants/me/applications",
  );

  const applications = data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className={pageTitle}>My applications</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everything you&apos;ve applied to, and where it stands.
        </p>
      </div>

      {error && (
        <div className={`${errorBanner} mb-4`} role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          Loading your applications…
        </div>
      )}

      {!loading && applications.length === 0 && !error && (
        <div className={`${card} p-10 text-center`}>
          <p className="text-sm text-slate-500">
            You haven&apos;t applied to anything yet.
          </p>
          <Link href="/jobs" className={`${btnPrimary} mt-4`}>
            Browse open roles
          </Link>
        </div>
      )}

      {applications.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[36rem]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className={th}>Role</th>
                <th className={th}>Applied</th>
                <th className={th}>Resume</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className={td}>
                    <Link
                      href={`/jobs/${application.jobId}`}
                      className="font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {application.jobTitle}
                    </Link>
                  </td>
                  <td className={td}>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                  <td className={td}>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Open
                    </a>
                  </td>
                  <td className={td}>
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

import { Badge, humanize } from "@/components/StatusBadge";
import { btnSecondary, card, errorBanner, pageTitle, td, th } from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { AuditLogResponse, PagedResponse } from "@/types";

const PAGE_SIZE = 20;

export default function AdminAuditLogsPage() {
  const [pageIndex, setPageIndex] = useState(0);

  // The endpoint already returns newest first; the sort makes that explicit.
  const query = new URLSearchParams({
    page: String(pageIndex),
    size: String(PAGE_SIZE),
    sort: "createdAt,DESC",
  });

  const { data, loading, error } = useResource<PagedResponse<AuditLogResponse>>(
    `/admin/audit-logs?${query.toString()}`,
  );

  const logs = data?.content ?? [];
  const totalPages = data?.page.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className={pageTitle}>Audit trail</h1>
        <p className="mt-1 text-sm text-slate-500">
          Logins, registrations and account activation changes, newest first.
        </p>
      </div>

      {error && (
        <div className={`${errorBanner} mb-4`} role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          Loading the audit trail…
        </div>
      )}

      {!loading && logs.length === 0 && !error && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          Nothing has been recorded yet.
        </div>
      )}

      {logs.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[48rem]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className={th}>Event</th>
                <th className={th}>Actor</th>
                <th className={th}>Detail</th>
                <th className={th}>When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={td}>
                    <Badge>{humanize(log.eventType)}</Badge>
                  </td>
                  <td className={td}>{log.actorEmail}</td>
                  <td className={`${td} text-slate-500`}>{log.detail}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className={btnSecondary}
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
          >
            ← Newer
          </button>
          <span className="text-sm text-slate-500">
            Page {pageIndex + 1} of {totalPages}
          </span>
          <button
            type="button"
            className={btnSecondary}
            disabled={pageIndex + 1 >= totalPages}
            onClick={() => setPageIndex((page) => page + 1)}
          >
            Older →
          </button>
        </div>
      )}
    </div>
  );
}

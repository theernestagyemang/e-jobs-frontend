"use client";

import { useState } from "react";

import { ActiveBadge, humanize } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import {
  btnSecondary,
  btnSmall,
  card,
  errorBanner,
  input,
  label,
  pageTitle,
  td,
  th,
} from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { PagedResponse, UserSummaryResponse } from "@/types";

const PAGE_SIZE = 20;

const ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "JOB_SEEKER", label: "Job seekers" },
  { value: "EMPLOYER", label: "Employers" },
];

export default function AdminUsersPage() {
  const [role, setRole] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const query = new URLSearchParams({
    page: String(pageIndex),
    size: String(PAGE_SIZE),
    sort: "createdAt,DESC",
  });
  if (role) query.set("role", role);

  const { data, setData, loading, error, token } = useResource<
    PagedResponse<UserSummaryResponse>
  >(`/admin/users?${query.toString()}`);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const users = data?.content ?? [];
  const totalPages = data?.page.totalPages ?? 0;

  async function setActive(user: UserSummaryResponse, active: boolean) {
    setBusyId(user.id);
    setActionError(null);
    try {
      const updated = await apiFetch<UserSummaryResponse>(
        `/admin/users/${user.id}/status`,
        { method: "PATCH", body: { active }, token },
      );
      setData((current) =>
        current
          ? {
              ...current,
              content: current.content.map((row) =>
                row.id === updated.id ? updated : row,
              ),
            }
          : current,
      );
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "Could not update the user.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Deactivating an account blocks login and invalidates its tokens.
          </p>
        </div>

        <div>
          <label className={label} htmlFor="role">
            Filter by role
          </label>
          <select
            id="role"
            className={`${input} w-auto`}
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPageIndex(0);
            }}
          >
            {ROLE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(error || actionError) && (
        <div className={`${errorBanner} mb-4`} role="alert">
          {actionError ?? error}
        </div>
      )}

      {loading && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          Loading users…
        </div>
      )}

      {!loading && users.length === 0 && !error && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          No users match that filter.
        </div>
      )}

      {users.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-[48rem]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Role</th>
                <th className={th}>Status</th>
                <th className={th}>Joined</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isAdmin = user.role === "ADMIN";
                return (
                  <tr key={user.id}>
                    <td className={`${td} font-medium text-slate-900`}>
                      {user.fullName}
                    </td>
                    <td className={td}>{user.email}</td>
                    <td className={td}>{humanize(user.role)}</td>
                    <td className={td}>
                      <ActiveBadge active={user.active} />
                    </td>
                    <td className={td}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className={td}>
                      <button
                        type="button"
                        // The backend refuses to change an administrator here.
                        disabled={isAdmin || busyId === user.id}
                        title={
                          isAdmin
                            ? "Administrator accounts cannot be changed"
                            : undefined
                        }
                        onClick={() => setActive(user, !user.active)}
                        className={`${btnSmall} ${
                          user.active
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {user.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
            ← Previous
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
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

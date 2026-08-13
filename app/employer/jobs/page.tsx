"use client";

import Link from "next/link";
import { useState } from "react";

import { JobStatusBadge, humanize } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import {
  btnPrimary,
  btnSecondary,
  card,
  errorBanner,
  input,
  label,
  pageTitle,
} from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { EmploymentType, JobResponse, JobStatus } from "@/types";

export default function EmployerJobsPage() {
  const { data, setData, loading, error, token, reload } =
    useResource<JobResponse[]>("/jobs/mine");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const jobs = data ?? [];

  function replaceJob(updated: JobResponse) {
    setData((current) =>
      (current ?? []).map((job) => (job.id === updated.id ? updated : job)),
    );
  }

  async function changeStatus(job: JobResponse, status: JobStatus) {
    setBusyId(job.id);
    setActionError(null);
    try {
      const updated = await apiFetch<JobResponse>(`/jobs/${job.id}/status`, {
        method: "PATCH",
        body: { status },
        token,
      });
      replaceJob(updated);
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "Could not update the job.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={pageTitle}>My job postings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every posting you own, in any status.
          </p>
        </div>
        <Link href="/employer/jobs/new" className={btnPrimary}>
          New job
        </Link>
      </div>

      {(error || actionError) && (
        <div className={`${errorBanner} mb-4`} role="alert">
          {actionError ?? error}
        </div>
      )}

      {loading && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          Loading your postings…
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className={`${card} p-10 text-center text-sm text-slate-500`}>
          You haven&apos;t posted a job yet.
        </div>
      )}

      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className={`${card} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-900">{job.title}</h2>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {job.location} · {humanize(job.employmentType)} · deadline{" "}
                  {new Date(job.deadline).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.status === "DRAFT" && (
                  <button
                    type="button"
                    className={btnPrimary}
                    disabled={busyId === job.id}
                    onClick={() => changeStatus(job, "ACTIVE")}
                  >
                    Activate
                  </button>
                )}
                {job.status === "ACTIVE" && (
                  <button
                    type="button"
                    className={btnSecondary}
                    disabled={busyId === job.id}
                    onClick={() => changeStatus(job, "CLOSED")}
                  >
                    Close
                  </button>
                )}
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() =>
                    setEditingId((current) =>
                      current === job.id ? null : job.id,
                    )
                  }
                >
                  {editingId === job.id ? "Cancel" : "Edit"}
                </button>
                <Link href={`/jobs/${job.id}`} className={btnSecondary}>
                  View
                </Link>
              </div>
            </div>

            {editingId === job.id && (
              <InlineEditForm
                job={job}
                token={token}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  replaceJob(updated);
                  setEditingId(null);
                  reload();
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "REMOTE"];

/** PUT /jobs/{id} — a partial update, so only edited fields need to be sent. */
function InlineEditForm({
  job,
  token,
  onCancel,
  onSaved,
}: {
  job: JobResponse;
  token: string | undefined;
  onCancel: () => void;
  onSaved: (job: JobResponse) => void;
}) {
  const [values, setValues] = useState({
    title: job.title,
    department: job.department ?? "",
    location: job.location,
    employmentType: job.employmentType,
    salaryRange: job.salaryRange ?? "",
    description: job.description,
    deadline: job.deadline,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<JobResponse>(`/jobs/${job.id}`, {
        method: "PUT",
        body: values,
        token,
      });
      onSaved(updated);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save the job.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"
    >
      {error && (
        <div className={`${errorBanner} sm:col-span-2`} role="alert">
          {error}
        </div>
      )}

      <div>
        <label className={label} htmlFor={`title-${job.id}`}>
          Title
        </label>
        <input
          id={`title-${job.id}`}
          className={input}
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        />
      </div>

      <div>
        <label className={label} htmlFor={`location-${job.id}`}>
          Location
        </label>
        <input
          id={`location-${job.id}`}
          className={input}
          value={values.location}
          onChange={(e) =>
            setValues((v) => ({ ...v, location: e.target.value }))
          }
        />
      </div>

      <div>
        <label className={label} htmlFor={`department-${job.id}`}>
          Department
        </label>
        <input
          id={`department-${job.id}`}
          className={input}
          value={values.department}
          onChange={(e) =>
            setValues((v) => ({ ...v, department: e.target.value }))
          }
        />
      </div>

      <div>
        <label className={label} htmlFor={`salary-${job.id}`}>
          Salary range
        </label>
        <input
          id={`salary-${job.id}`}
          className={input}
          value={values.salaryRange}
          onChange={(e) =>
            setValues((v) => ({ ...v, salaryRange: e.target.value }))
          }
        />
      </div>

      <div>
        <label className={label} htmlFor={`type-${job.id}`}>
          Employment type
        </label>
        <select
          id={`type-${job.id}`}
          className={input}
          value={values.employmentType}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              employmentType: e.target.value as EmploymentType,
            }))
          }
        >
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {humanize(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor={`deadline-${job.id}`}>
          Deadline
        </label>
        <input
          id={`deadline-${job.id}`}
          type="date"
          className={input}
          value={values.deadline}
          onChange={(e) =>
            setValues((v) => ({ ...v, deadline: e.target.value }))
          }
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label} htmlFor={`description-${job.id}`}>
          Description
        </label>
        <textarea
          id={`description-${job.id}`}
          rows={5}
          className={input}
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
        />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className={btnPrimary} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className={btnSecondary}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

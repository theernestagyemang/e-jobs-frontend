"use client";

import { useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  btnPrimary,
  btnSecondary,
  card,
  errorBanner,
  fieldError,
  input,
  label,
  successBanner,
} from "@/lib/ui";
import type { ApplicationResponse } from "@/types";

export default function ApplyButton({ jobId }: { jobId: string }) {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [touched, setTouched] = useState(false);

  if (!ready) {
    return <div className="h-10" aria-hidden />;
  }

  if (!user || user.role !== "JOB_SEEKER") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          title="Log in as a Job Seeker to apply"
          className={`${btnPrimary} cursor-not-allowed`}
        >
          Apply for this role
        </button>
        <p className="text-sm text-slate-500">
          Log in as a Job Seeker to apply.
        </p>
      </div>
    );
  }

  if (applied) {
    return (
      <div className={successBanner} role="status">
        Application submitted. Track it under{" "}
        <span className="font-medium">My Applications</span>.
      </div>
    );
  }

  const coverNoteError = touched && !coverNote.trim() ? "A cover note is required" : null;
  const resumeUrlError =
    touched && !isHttpUrl(resumeUrl) ? "Enter a valid resume URL (http/https)" : null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!coverNote.trim() || !isHttpUrl(resumeUrl)) return;

    setSubmitting(true);
    setError(null);
    try {
      await apiFetch<ApplicationResponse>(`/jobs/${jobId}/applications`, {
        method: "POST",
        body: { coverNote: coverNote.trim(), resumeUrl: resumeUrl.trim() },
        token: user?.token,
      });
      setApplied(true);
      setOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not submit the application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className={btnPrimary} onClick={() => setOpen(true)}>
        Apply for this role
      </button>
    );
  }

  return (
    <form onSubmit={submit} className={`${card} space-y-4 p-5`} noValidate>
      <h3 className="font-semibold text-slate-900">Your application</h3>

      {error && (
        <div className={errorBanner} role="alert">
          {error}
        </div>
      )}

      <div>
        <label className={label} htmlFor="coverNote">
          Cover note
        </label>
        <textarea
          id="coverNote"
          rows={5}
          className={input}
          placeholder="Why you're a good fit for this role…"
          value={coverNote}
          onChange={(event) => setCoverNote(event.target.value)}
        />
        {coverNoteError && <p className={fieldError}>{coverNoteError}</p>}
      </div>

      <div>
        <label className={label} htmlFor="resumeUrl">
          Resume URL
        </label>
        <input
          id="resumeUrl"
          type="url"
          className={input}
          placeholder="https://drive.example.com/my-resume.pdf"
          value={resumeUrl}
          onChange={(event) => setResumeUrl(event.target.value)}
        />
        {resumeUrlError && <p className={fieldError}>{resumeUrlError}</p>}
      </div>

      <div className="flex gap-2">
        <button type="submit" className={btnPrimary} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit application"}
        </button>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Matches the backend's @URL constraint closely enough for a client hint. */
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

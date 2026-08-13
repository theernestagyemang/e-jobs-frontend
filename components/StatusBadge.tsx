import type { ApplicationStatus, JobStatus } from "@/types";

const BASE =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

const JOB_TONE: Record<JobStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CLOSED: "bg-rose-50 text-rose-700 ring-rose-200",
};

const APPLICATION_TONE: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-slate-100 text-slate-700 ring-slate-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 ring-blue-200",
  SHORTLISTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};

/** Turns SCREAMING_SNAKE_CASE into "Screaming snake case". */
export function humanize(value: string): string {
  const words = value.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <span className={`${BASE} ${JOB_TONE[status]}`}>{humanize(status)}</span>;
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`${BASE} ${APPLICATION_TONE[status]}`}>
      {humanize(status)}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`${BASE} ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </span>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className={`${BASE} bg-indigo-50 text-indigo-700 ring-indigo-200`}>
      {children}
    </span>
  );
}

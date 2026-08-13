/**
 * Mirrors the backend DTOs in com.ejobs.portal.dto — field names match exactly.
 *
 * Java -> TS mapping used throughout:
 *   UUID       -> string
 *   Instant    -> string (ISO-8601 instant, e.g. "2026-08-13T09:41:00Z")
 *   LocalDate  -> string ("YYYY-MM-DD")
 *   long       -> number
 */

/* ------------------------------------------------------------------ enums */

export type Role = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "REMOTE";

export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "REJECTED";

export type AuditEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "REGISTER"
  | "USER_DEACTIVATED"
  | "USER_REACTIVATED"
  | "ADMIN_CREATED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED";

/* ------------------------------------------------------------------- auth */

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  fullName: string;
}

/* ------------------------------------------------------------------- jobs */

export interface JobResponse {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange: string;
  description: string;
  /** LocalDate — "YYYY-MM-DD" */
  deadline: string;
  status: JobStatus;
  createdAt: string;
}

/** Lighter projection for list/search results — omits `description`. */
export interface JobSummaryResponse {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange: string;
  /** LocalDate — "YYYY-MM-DD" */
  deadline: string;
  status: JobStatus;
  createdAt: string;
}

/* ----------------------------------------------------------- applications */

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  coverNote: string;
  resumeUrl: string;
  status: ApplicationStatus;
  appliedAt: string;
}

/* ------------------------------------------------------------------ admin */

export interface UserSummaryResponse {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface AuditLogResponse {
  id: string;
  eventType: AuditEventType;
  actorEmail: string;
  detail: string;
  createdAt: string;
}

export interface PlatformStatsResponse {
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
}

/* ---------------------------------------------------------------- paging */

/**
 * Spring's stable PagedModel envelope, returned by every paginated endpoint
 * (GET /jobs, GET /admin/users, GET /admin/audit-logs). The paging metadata
 * lives under `page`, not at the top level.
 */
export interface PagedResponse<T> {
  content: T[];
  page: {
    /** Page size. */
    size: number;
    /** Zero-based page index. */
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/* --------------------------------------------------------------- requests */

export interface LoginRequest {
  email: string;
  password: string;
}

/** Self-registration can only mint JOB_SEEKER or EMPLOYER — never ADMIN. */
export type RegisterableRole = Exclude<Role, "ADMIN">;

export interface RegisterRequest {
  fullName: string;
  email: string;
  /** 8–72 characters (BCrypt ignores input past 72 bytes). */
  password: string;
  role: RegisterableRole;
}

export interface JobCreateRequest {
  title: string;
  department?: string;
  location: string;
  employmentType: EmploymentType;
  salaryRange?: string;
  description: string;
  /** "YYYY-MM-DD", today or later. */
  deadline: string;
}

/** Partial update — an omitted field is left unchanged. */
export type JobUpdateRequest = Partial<JobCreateRequest>;

export interface JobStatusUpdateRequest {
  status: JobStatus;
}

export interface ApplicationCreateRequest {
  coverNote: string;
  resumeUrl: string;
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus;
}

export interface UserStatusUpdateRequest {
  active: boolean;
}

/* ------------------------------------------------------------------ error */

/** Consistent error envelope returned for every non-2xx response. */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

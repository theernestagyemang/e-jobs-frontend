"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/AuthProvider";
import { humanize } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";
import {
  btnPrimary,
  btnSecondary,
  card,
  errorBanner,
  fieldError,
  input,
  label,
  pageTitle,
} from "@/lib/ui";
import type { EmploymentType, JobResponse } from "@/types";

const TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "REMOTE"];

const today = () => new Date().toISOString().slice(0, 10);

// Mirrors JobCreateRequest: title/location/description @NotBlank,
// employmentType @NotNull, deadline @NotNull @FutureOrPresent.
// department and salaryRange are optional on the backend.
const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  department: z.string().trim(),
  location: z.string().trim().min(1, "Location is required"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "REMOTE"]),
  salaryRange: z.string().trim(),
  description: z.string().trim().min(1, "Description is required"),
  deadline: z
    .string()
    .min(1, "Deadline is required")
    .refine((value) => value >= today(), "Deadline cannot be in the past"),
});

type FormValues = z.infer<typeof schema>;

export default function NewJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      employmentType: "FULL_TIME",
      salaryRange: "",
      description: "",
      deadline: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await apiFetch<JobResponse>("/jobs", {
        method: "POST",
        body: {
          ...values,
          department: values.department || undefined,
          salaryRange: values.salaryRange || undefined,
        },
        token: user?.token,
      });
      router.push("/employer/jobs");
      router.refresh();
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not create the job.",
      );
    }
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/employer/jobs"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to my postings
      </Link>

      <div className={`${card} mt-4 p-8`}>
        <h1 className={pageTitle}>New job posting</h1>
        <p className="mt-1 text-sm text-slate-500">
          It starts as a draft — activate it from your postings list when
          you&apos;re ready to publish.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
          {apiError && (
            <div className={`${errorBanner} sm:col-span-2`} role="alert">
              {apiError}
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={label} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className={input}
              placeholder="Senior Backend Engineer"
              {...register("title")}
            />
            {errors.title && <p className={fieldError}>{errors.title.message}</p>}
          </div>

          <div>
            <label className={label} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className={input}
              placeholder="Accra, Ghana"
              {...register("location")}
            />
            {errors.location && (
              <p className={fieldError}>{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="employmentType">
              Employment type
            </label>
            <select
              id="employmentType"
              className={input}
              {...register("employmentType")}
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {humanize(type)}
                </option>
              ))}
            </select>
            {errors.employmentType && (
              <p className={fieldError}>{errors.employmentType.message}</p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="department">
              Department <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="department"
              className={input}
              placeholder="Engineering"
              {...register("department")}
            />
          </div>

          <div>
            <label className={label} htmlFor="salaryRange">
              Salary range <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="salaryRange"
              className={input}
              placeholder="GHS 8,000 – 12,000 / month"
              {...register("salaryRange")}
            />
          </div>

          <div>
            <label className={label} htmlFor="deadline">
              Application deadline
            </label>
            <input
              id="deadline"
              type="date"
              min={today()}
              className={input}
              {...register("deadline")}
            />
            {errors.deadline && (
              <p className={fieldError}>{errors.deadline.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={8}
              className={input}
              placeholder="Responsibilities, requirements, what the team is like…"
              {...register("description")}
            />
            {errors.description && (
              <p className={fieldError}>{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create draft"}
            </button>
            <Link href="/employer/jobs" className={btnSecondary}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

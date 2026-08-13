"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  btnPrimary,
  card,
  errorBanner,
  fieldError,
  input,
  label,
  pageTitle,
  successBanner,
  td,
  th,
} from "@/lib/ui";
import { useResource } from "@/lib/useResource";
import type { PagedResponse, UserSummaryResponse } from "@/types";

// Mirrors CreateAdminRequest: @NotBlank fullName, @Email email,
// @Size(min = 8, max = 72) password. No role field — this endpoint only
// ever mints administrators.
const schema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminAdminsPage() {
  const { user } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [created, setCreated] = useState<UserSummaryResponse | null>(null);

  const { data, loading, error, reload } = useResource<
    PagedResponse<UserSummaryResponse>
  >("/admin/users?role=ADMIN&page=0&size=50&sort=createdAt,DESC");

  const admins = data?.content ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    setCreated(null);
    try {
      const admin = await apiFetch<UserSummaryResponse>("/admin/admins", {
        method: "POST",
        body: values,
        token: user?.token,
      });
      setCreated(admin);
      reset();
      reload();
    } catch (caught) {
      setApiError(
        caught instanceof Error
          ? caught.message
          : "Could not create the administrator.",
      );
    }
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className={pageTitle}>Administrators</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administrator accounts can only be created here — registration refuses
          the ADMIN role outright.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ------------------------------------------------ current admins */}
        <section className={`${card} overflow-hidden`}>
          <header className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Current administrators</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Every account with full platform access.
            </p>
          </header>

          {error && (
            <div className="p-5">
              <div className={errorBanner} role="alert">
                {error}
              </div>
            </div>
          )}

          {loading && (
            <p className="p-10 text-center text-sm text-slate-500">
              Loading administrators…
            </p>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className={`${td} font-medium text-slate-900`}>
                        {admin.fullName}
                        {admin.email === user?.email && (
                          <span className="ml-2 text-xs font-normal text-slate-400">
                            you
                          </span>
                        )}
                      </td>
                      <td className={td}>{admin.email}</td>
                      <td className={td}>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* --------------------------------------------------- create form */}
        <section className={`${card} h-fit p-5`}>
          <h2 className="font-semibold text-slate-900">Add an administrator</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            They can sign in immediately with the password you set here.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
            {created && (
              <div className={successBanner} role="status">
                {created.fullName} ({created.email}) can now sign in as an
                administrator.
              </div>
            )}

            {apiError && (
              <div className={errorBanner} role="alert">
                {apiError}
              </div>
            )}

            <div>
              <label className={label} htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className={input}
                placeholder="Ama Serwaa"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className={fieldError}>{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className={label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={input}
                placeholder="name@e-jobs.com"
                {...register("email")}
              />
              {errors.email && (
                <p className={fieldError}>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className={label} htmlFor="password">
                Temporary password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={input}
                placeholder="At least 8 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className={fieldError}>{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className={`${btnPrimary} w-full`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create administrator"}
            </button>

            <p className="text-xs text-slate-500">
              Administrator accounts cannot be deactivated from the Users page,
              so add them sparingly.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

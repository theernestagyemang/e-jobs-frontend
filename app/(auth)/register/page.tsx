"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/AuthProvider";
import {
  btnPrimary,
  card,
  errorBanner,
  fieldError,
  input,
  label,
} from "@/lib/ui";

// Mirrors RegisterRequest: @NotBlank fullName, @Email email,
// @Size(min = 8, max = 72) password, @NotNull role.
// ADMIN is deliberately absent — admin accounts are never self-registered.
const schema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  role: z.enum(["JOB_SEEKER", "EMPLOYER"]),
});

type FormValues = z.infer<typeof schema>;

const ROLES = [
  {
    value: "JOB_SEEKER" as const,
    title: "Job seeker",
    blurb: "Browse postings and track your applications.",
  },
  {
    value: "EMPLOYER" as const,
    title: "Employer",
    blurb: "Publish jobs and run your hiring pipeline.",
  },
];

export default function RegisterPage() {
  // `ready` gates the submit button: before hydration a click would fall
  // through to a native GET, putting the typed password in the URL.
  const { register: registerUser, ready } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", role: "JOB_SEEKER" },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await registerUser(
        values.fullName,
        values.email,
        values.password,
        values.role,
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Could not create the account. Try again.",
      );
    }
  });

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className={`${card} p-8`}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          You&apos;ll be signed in as soon as you register.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
              type="text"
              autoComplete="name"
              className={input}
              placeholder="Ada Lovelace"
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
              autoComplete="email"
              className={input}
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className={fieldError}>{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={label} htmlFor="password">
              Password
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

          <fieldset>
            <legend className={label}>I am a…</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROLES.map((role) => (
                <label
                  key={role.value}
                  className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                    selectedRole === role.value
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    value={role.value}
                    className="sr-only"
                    {...register("role")}
                  />
                  <span className="block font-medium text-slate-900">
                    {role.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {role.blurb}
                  </span>
                </label>
              ))}
            </div>
            {errors.role && <p className={fieldError}>{errors.role.message}</p>}
          </fieldset>

          <button
            type="submit"
            className={`${btnPrimary} w-full`}
            disabled={!ready || isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

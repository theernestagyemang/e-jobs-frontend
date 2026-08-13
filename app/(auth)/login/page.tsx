"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

// Mirrors LoginRequest: @NotBlank @Email email, @NotBlank password.
const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  // `ready` gates the submit button: before hydration a click would fall
  // through to a native GET, putting the typed password in the URL.
  const { login, ready } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await login(values.email, values.password);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Could not log in. Try again.",
      );
    }
  });

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className={`${card} p-8`}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Log in
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back to e-JOBS.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {apiError && (
            <div className={errorBanner} role="alert">
              {apiError}
            </div>
          )}

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
              autoComplete="current-password"
              className={input}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className={fieldError}>{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className={`${btnPrimary} w-full`}
            disabled={!ready || isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          No account yet?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

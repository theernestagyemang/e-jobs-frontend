/**
 * Shared Tailwind class strings so the pages stay visually consistent without a
 * component library. Plain constants — no runtime cost, no client boundary.
 */

export const card = "rounded-xl border border-slate-200 bg-white shadow-sm";

export const label = "mb-1 block text-sm font-medium text-slate-700";

export const input =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:bg-slate-50";

export const fieldError = "mt-1 text-xs text-rose-600";

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = `${btnBase} bg-indigo-600 text-white hover:bg-indigo-700`;

export const btnSecondary = `${btnBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;

export const btnDanger = `${btnBase} border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`;

export const btnSmall =
  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const errorBanner =
  "rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700";

export const successBanner =
  "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700";

export const pageTitle = "text-2xl font-semibold tracking-tight text-slate-900";

export const th =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";

export const td = "px-4 py-3 text-sm text-slate-700 align-top";

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { EmploymentType } from "@/types";

const TYPES: Array<{ value: EmploymentType | ""; label: string }> = [
  { value: "", label: "Any type" },
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "REMOTE", label: "Remote" },
];

/** Hands the query straight to /jobs, which does the real searching. */
export default function HeroSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  return (
    <form
      className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (keyword.trim()) params.set("keyword", keyword.trim());
        if (location.trim()) params.set("location", location.trim());
        if (employmentType) params.set("employmentType", employmentType);
        const query = params.toString();
        router.push(query ? `/jobs?${query}` : "/jobs");
      }}
    >
      <label className="sr-only" htmlFor="hero-keyword">
        What kind of work
      </label>
      <input
        id="hero-keyword"
        className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        placeholder="Job title or keyword"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />

      <label className="sr-only" htmlFor="hero-location">
        Where
      </label>
      <input
        id="hero-location"
        className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        placeholder="Location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
      />

      <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />

      <label className="sr-only" htmlFor="hero-type">
        Employment type
      </label>
      <select
        id="hero-type"
        className="rounded-full bg-transparent px-4 py-2.5 text-sm text-slate-600 focus:outline-none"
        value={employmentType}
        onChange={(event) => setEmploymentType(event.target.value)}
      >
        {TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none"
      >
        Search jobs
      </button>
    </form>
  );
}

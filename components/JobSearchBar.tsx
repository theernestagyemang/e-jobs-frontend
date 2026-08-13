"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { btnPrimary, btnSecondary, card, input, label } from "@/lib/ui";
import type { EmploymentType } from "@/types";

const TYPES: Array<{ value: EmploymentType | ""; label: string }> = [
  { value: "", label: "Any type" },
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "REMOTE", label: "Remote" },
];

export interface JobSearchValues {
  keyword: string;
  location: string;
  employmentType: string;
}

/** Writes the filters into the URL; the server component re-fetches from there. */
export default function JobSearchBar({ initial }: { initial: JobSearchValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);

  function submit(next: JobSearchValues) {
    const params = new URLSearchParams();
    if (next.keyword.trim()) params.set("keyword", next.keyword.trim());
    if (next.location.trim()) params.set("location", next.location.trim());
    if (next.employmentType) params.set("employmentType", next.employmentType);
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  }

  const isFiltered =
    Boolean(values.keyword) || Boolean(values.location) || Boolean(values.employmentType);

  return (
    <form
      className={`${card} grid gap-4 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end`}
      onSubmit={(event) => {
        event.preventDefault();
        submit(values);
      }}
    >
      <div>
        <label className={label} htmlFor="keyword">
          Keyword
        </label>
        <input
          id="keyword"
          className={input}
          placeholder="Title or description"
          value={values.keyword}
          onChange={(event) =>
            setValues((v) => ({ ...v, keyword: event.target.value }))
          }
        />
      </div>

      <div>
        <label className={label} htmlFor="location">
          Location
        </label>
        <input
          id="location"
          className={input}
          placeholder="Accra, Remote…"
          value={values.location}
          onChange={(event) =>
            setValues((v) => ({ ...v, location: event.target.value }))
          }
        />
      </div>

      <div>
        <label className={label} htmlFor="employmentType">
          Type
        </label>
        <select
          id="employmentType"
          className={input}
          value={values.employmentType}
          onChange={(event) =>
            setValues((v) => ({ ...v, employmentType: event.target.value }))
          }
        >
          {TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>
          Search
        </button>
        {isFiltered && (
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              const cleared = { keyword: "", location: "", employmentType: "" };
              setValues(cleared);
              submit(cleared);
            }}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

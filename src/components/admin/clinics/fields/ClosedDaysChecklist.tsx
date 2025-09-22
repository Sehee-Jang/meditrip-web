"use client";

import { useFormContext } from "react-hook-form";
import type { ClinicFormInput } from "../form-context";
import { CLOSED_DAYS_ORDER } from "../form-utils";

const DAY_LABELS: Record<(typeof CLOSED_DAYS_ORDER)[number], string> = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
};

export default function ClosedDaysChecklist() {
  const { register } = useFormContext<ClinicFormInput>();

  return (
    <div className='px-5 py-4'>
      <div className='flex flex-wrap gap-2'>
        {CLOSED_DAYS_ORDER.map((d) => (
          <label key={d} className='inline-flex'>
            <input
              type='checkbox'
              value={d}
              {...register("weeklyClosedDays")}
              className='peer sr-only'
            />
            <span
              className='select-none rounded-xl border px-3 py-1.5 text-sm text-muted-foreground
                             transition peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700
                             peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-indigo-600'
            >
              {DAY_LABELS[d]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

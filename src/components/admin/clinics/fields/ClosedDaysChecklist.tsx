"use client";

import { useFormContext } from "react-hook-form";
import type { ClinicFormInput } from "../form-context";
import { CLOSED_DAYS_ORDER } from "../form-utils";

export default function ClosedDaysChecklist() {
  const { register } = useFormContext<ClinicFormInput>();
  return (
    <div className='flex flex-wrap gap-3 px-5 py-2'>
      {CLOSED_DAYS_ORDER.map((d) => (
        <label key={d} className='inline-flex items-center gap-2'>
          <input type='checkbox' value={d} {...register("weeklyClosedDays")} />
          <span className='uppercase text-sm'>{d}</span>
        </label>
      ))}
    </div>
  );
}

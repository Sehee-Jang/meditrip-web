"use client";

import { useFormContext } from "react-hook-form";
import type { ClinicFormInput } from "../form-context";
import { AMENITY_VALUES } from "../form-utils";

export default function AmenitiesChecklist() {
  const { register } = useFormContext<ClinicFormInput>();
  return (
    <div className='px-5 py-4 grid grid-cols-2 md:grid-cols-5 gap-3'>
      {AMENITY_VALUES.map((k) => (
        <label key={k} className='inline-flex items-center gap-2 text-sm'>
          <input type='checkbox' {...register("amenities")} value={k} />
          <span>{k}</span>
        </label>
      ))}
    </div>
  );
}

"use client";

import { useFormContext } from "react-hook-form";
import type { Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ClinicFormInput } from "../form-context";
import { DAY_KEYS, toUndef } from "../form-utils";

export default function WeeklyHoursGrid() {
  const { register } = useFormContext<ClinicFormInput>();
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 px-5 py-4'>
      {DAY_KEYS.map((d) => {
        const openName = `weeklyHours.${d}.0.open` as Path<ClinicFormInput>;
        const closeName = `weeklyHours.${d}.0.close` as Path<ClinicFormInput>;
        return (
          <div key={d} className='space-y-2'>
            <div className='text-xs text-muted-foreground uppercase'>{d}</div>
            <div className='flex gap-2'>
              <Input
                {...register(openName, { setValueAs: toUndef })}
                placeholder='09:00'
              />
              <Input
                {...register(closeName, { setValueAs: toUndef })}
                placeholder='18:00'
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

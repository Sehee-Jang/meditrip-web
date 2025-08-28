"use client";

import { useFormContext, type Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ClinicFormInput } from "../form-context";
import { DAY_KEYS, toUndef } from "../form-utils";

const DAY_LABELS: Record<(typeof DAY_KEYS)[number], string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

export default function WeeklyHoursGrid() {
  const { register } = useFormContext<ClinicFormInput>();

  return (
    <div className='px-5 py-4'>
      <div className='grid gap-2'>
        {DAY_KEYS.map((d) => {
          const openName = `weeklyHours.${d}.0.open` as Path<ClinicFormInput>;
          const closeName = `weeklyHours.${d}.0.close` as Path<ClinicFormInput>;
          return (
            <div
              key={d}
              className='grid grid-cols-[64px_1fr] items-center gap-3 rounded-lg border px-3 py-2'
            >
              <div className='text-xs font-medium text-muted-foreground'>
                {DAY_LABELS[d]}
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  type='time'
                  step={60}
                  {...register(openName, { setValueAs: toUndef })}
                  placeholder='09:00'
                  className='h-8'
                />
                <span className='text-sm text-muted-foreground'>~</span>
                <Input
                  type='time'
                  step={60}
                  {...register(closeName, { setValueAs: toUndef })}
                  placeholder='18:00'
                  className='h-8'
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

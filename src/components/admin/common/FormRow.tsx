"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  control: React.ReactNode;
  helpText?: string;
  errorText?: string;
  className?: string;
}

export default function FormRow({
  label,
  control,
  helpText,
  errorText,
  className,
}: Props) {
  return (
    <div className={cn("px-5 py-4 flex items-start gap-4", className)}>
      <div className='w-36 shrink-0 pt-2'>
        <label className='text-[12px] font-medium text-muted-foreground'>
          {label}
        </label>
      </div>
      <div className='flex-1'>
        <div className='space-y-1'>
          {control}
          {helpText && (
            <p className='text-[11px] text-muted-foreground'>{helpText}</p>
          )}
          {errorText && <p className='text-[11px] text-red-600'>{errorText}</p>}
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2;
}

export default function FormSection({
  title,
  description,
  children,
  columns = 2,
}: FormSectionProps) {
  return (
    <section className='mb-8'>
      <header className='mb-3'>
        <h3 className='text-sm font-semibold'>{title}</h3>
        {description ? (
          <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
        ) : null}
      </header>
      <div
        className={
          columns === 2
            ? "grid grid-cols-1 gap-4 md:grid-cols-2"
            : "grid grid-cols-1 gap-4"
        }
      >
        {children}
      </div>
    </section>
  );
}

"use client";

import * as React from "react";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, description, children }: Props) {
  return (
    <section className='rounded-2xl border bg-background shadow-sm'>
      <header className='px-5 pt-5'>
        <h3 className='text-m font-semibold'>{title}</h3>
        {description && (
          <p className='mt-1 mb-2 text-[13px] text-muted-foreground'>
            {description}
          </p>
        )}
      </header>
      <div className='divide-y'>{children}</div>
    </section>
  );
}

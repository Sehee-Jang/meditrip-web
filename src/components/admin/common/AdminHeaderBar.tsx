"use client";

import * as React from "react";

interface Props {
  title: string;
  description?: React.ReactNode;
}

export default function AdminHeaderBar({ title, description }: Props) {
  return (
    <div className='max-w-5xl mx-auto w-full px-4 py-10 space-y-8'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-[-0.01em]'>{title}</h1>
        {description ? (
          <p className='text-muted-foreground text-sm'>{description}</p>
        ) : null}
      </div>
    </div>
  );
}

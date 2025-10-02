import React from "react";

export default function ClinicDetailSkeleton() {
  return (
    <div className='animate-pulse flex flex-col gap-8'>
      <div className='w-full overflow-hidden rounded-2xl bg-muted aspect-video' />

      <div className='px-4 pt-2 space-y-4'>
        <div className='h-8 w-3/4 rounded bg-muted' />
        <div className='h-5 w-1/2 rounded bg-muted' />
        <div className='space-y-2'>
          <div className='h-4 w-full rounded bg-muted' />
          <div className='h-4 w-5/6 rounded bg-muted' />
        </div>
        <div className='mt-4 flex flex-wrap gap-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='h-6 w-20 rounded-full bg-muted/80' />
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <div className='grid grid-cols-2 gap-2'>
          <div className='h-12 rounded-xl border border-border bg-muted/70' />
          <div className='h-12 rounded-xl border border-border bg-muted/70' />
        </div>
        <div className='rounded-2xl border border-border bg-card p-4 space-y-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='h-10 rounded-lg bg-muted/60' />
          ))}
        </div>
      </div>

      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='rounded-2xl border border-border bg-card p-4 space-y-3'
          >
            <div className='h-5 w-1/3 rounded bg-muted' />
            <div className='space-y-2'>
              <div className='h-4 w-full rounded bg-muted/60' />
              <div className='h-4 w-5/6 rounded bg-muted/60' />
              <div className='h-4 w-2/3 rounded bg-muted/60' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

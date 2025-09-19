"use client";
export function Pagination({
  current,
  pageMax,
  onChange,
}: {
  current: number;
  pageMax: number;
  onChange: (p: number) => void;
}) {
  const span = 5;
  const half = Math.floor(span / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(pageMax, start + span - 1);
  start = Math.max(1, end - span + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      aria-label='페이지네이션'
      className='flex items-center justify-center gap-1 py-3'
    >
      <button
        type='button'
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className='h-8 px-3 rounded-full border text-xs bg-background border-border disabled:opacity-50 hover:bg-accent'
      >
        이전
      </button>
      {pages.map((p) => {
        const isCurrent = p === current;
        return (
          <button
            key={p}
            type='button'
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onChange(p)}
            className={[
              "h-8 min-w-8 px-3 rounded-full border text-xs",
              isCurrent
                ? "bg-gray-900 border-border text-white"
                : "bg-background border-border hover:bg-accent",
            ].join(" ")}
          >
            {p}
          </button>
        );
      })}
      <button
        type='button'
        disabled={current === pageMax}
        onClick={() => onChange(current + 1)}
        className='h-8 px-3 rounded-full border text-xs bg-background border-border disabled:opacity-50 hover:bg-accent'
      >
        다음
      </button>
    </nav>
  );
}

"use client";

import {
  Pagination as Pg,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { buildPageRange } from "@/utils/pagination";

type Props = {
  current: number; // 현재 페이지(1-base)
  totalPages: number; // 전체 페이지 수(최소 1)
  onChange: (next: number) => void;
  className?: string;
};

export default function PaginationControls({
  current,
  totalPages,
  onChange,
  className,
}: Props) {
  if (totalPages <= 1) return null;

  const items = buildPageRange(current, totalPages);

  return (
    <Pg className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            className={
              current === 1 ? "opacity-50 pointer-events-none" : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              if (current > 1) onChange(current - 1);
            }}
          />
        </PaginationItem>

        {items.map((it, i) =>
          it === "…" ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={it}>
              <PaginationLink
                href='#'
                isActive={it === current}
                onClick={(e) => {
                  e.preventDefault();
                  if (it !== current) onChange(it);
                }}
              >
                {it}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href='#'
            className={
              current === totalPages
                ? "opacity-50 pointer-events-none"
                : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              if (current < totalPages) onChange(current + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pg>
  );
}

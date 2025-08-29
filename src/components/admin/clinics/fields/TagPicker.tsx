"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TagWithId } from "@/types/tag";
import type { LocaleKey } from "@/constants/locales";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  catalog: TagWithId[]; // 전체 카탈로그(부모에서 주입)
  locale: LocaleKey; // 라벨 표시 언어
  placeholder?: string;
  disabled?: boolean;
};

export default function TagPicker({
  value,
  onChange,
  catalog,
  locale,
  placeholder = "태그 검색…",
  disabled = false,
}: Props) {
  const [q, setQ] = React.useState("");

  const selected = React.useMemo(() => new Set(value), [value]);

  const labelOf = React.useCallback(
    (t: TagWithId): string => t.labels?.[locale] || t.slug,
    [locale]
  );

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return catalog;
    const norm = (s: string) => s.toLowerCase();
    return catalog.filter((t) => {
      const pool = [
        t.slug,
        t.labels.ko,
        t.labels.ja,
        t.labels.zh,
        t.labels.en,
      ].map(norm);
      return pool.some((s) => s.includes(needle));
    });
  }, [catalog, q]);

  const toggle = (slug: string) => {
    if (selected.has(slug)) onChange(value.filter((v) => v !== slug));
    else onChange([...value, slug]);
  };

  const clear = () => onChange([]);

  // 1) 추천/전체 그리드(검색어 없을 때 먼저 노출)
  const showGrid = q.trim() === "";
  // 그룹이 있으면 그룹 순서로 정렬, 없으면 라벨로 정렬
  const gridItems = React.useMemo(() => {
    const order: Record<string, number> = {
      focus: 0,
      condition: 1,
      service: 2,
    };
    return [...catalog].sort((a, b) => {
      const ag = a.group ?? "zzz";
      const bg = b.group ?? "zzz";
      if (ag !== bg) return (order[ag] ?? 9) - (order[bg] ?? 9);
      return labelOf(a).localeCompare(labelOf(b));
    });
  }, [catalog, labelOf]);

  return (
    <div className='space-y-3'>
      {/* 검색창 */}
      <div className='flex items-center gap-2'>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className='h-9'
          disabled={disabled}
        />
        {q && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setQ("")}
          >
            지우기
          </Button>
        )}
      </div>

      {/* 선택된 태그 */}
      {value.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {value.map((slug) => {
            const tag = catalog.find((t) => t.slug === slug);
            const label = tag ? labelOf(tag) : slug;
            return (
              <span
                key={slug}
                className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs bg-background'
              >
                {label}
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground'
                  onClick={() => toggle(slug)}
                  aria-label={`${label} 제거`}
                >
                  ×
                </button>
              </span>
            );
          })}
          <Button type='button' variant='ghost' size='sm' onClick={clear}>
            모두 제거
          </Button>
        </div>
      )}

      {/* 후보 표시: (A) 그리드(검색어 없음) / (B) 리스트(검색 결과) */}
      {showGrid ? (
        <ul className='grid grid-cols-2 md:grid-cols-3 gap-2'>
          {gridItems.map((t) => {
            const active = selected.has(t.slug);
            return (
              <li key={t.slug}>
                <button
                  type='button'
                  onClick={() => toggle(t.slug)}
                  disabled={disabled}
                  className={[
                    "w-full rounded-md border px-3 py-2 text-sm transition",
                    active
                      ? "bg-primary/10 border-primary/30"
                      : "hover:bg-muted/60",
                  ].join(" ")}
                >
                  {labelOf(t)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className='max-h-56 overflow-auto rounded-md border divide-y'>
          {filtered.length > 0 ? (
            filtered.map((t) => {
              const active = selected.has(t.slug);
              const label = labelOf(t);
              return (
                <li key={t.slug}>
                  <button
                    type='button'
                    onClick={() => toggle(t.slug)}
                    className={[
                      "w-full text-left px-3 py-2 text-sm",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/60",
                    ].join(" ")}
                    disabled={disabled}
                  >
                    {label}
                    {!label.toLowerCase().includes(q.trim().toLowerCase()) && (
                      <span className='ml-2 text-xs text-muted-foreground'>
                        ({t.slug})
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          ) : (
            <li className='px-3 py-2 text-sm text-muted-foreground'>
              결과가 없습니다
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

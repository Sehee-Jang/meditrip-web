"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option<T extends string> = { value: T; label: string };

export function FilterRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {children}
    </div>
  );
}

interface SelectFilterProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<Option<T>>;
  placeholder?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}

export function SelectFilter<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  triggerClassName,
  "aria-label": ariaLabel,
}: SelectFilterProps<T>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={triggerClassName ?? "h-9 w-[140px] text-sm bg-white"}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 도메인별 프리셋 ------------------------------

// 답변 여부
export type AnsweredFilter = "all" | "yes" | "no";
export function AnsweredSelect(
  props: Omit<SelectFilterProps<AnsweredFilter>, "options">
) {
  return (
    <SelectFilter
      {...props}
      options={[
        { value: "all", label: "답변 상태(전체)" },
        { value: "yes", label: "답변 완료" },
        { value: "no", label: "미답변" },
      ]}
      aria-label='답변여부'
    />
  );
}

// 노출 여부
export type VisibilityFilter = "all" | "visible" | "hidden";
export function VisibilitySelect(
  props: Omit<SelectFilterProps<VisibilityFilter>, "options">
) {
  return (
    <SelectFilter
      {...props}
      options={[
        { value: "all", label: "노출 상태(전체)" },
        { value: "visible", label: "표시" },
        { value: "hidden", label: "숨김" },
      ]}
      aria-label='노출 상태'
    />
  );
}

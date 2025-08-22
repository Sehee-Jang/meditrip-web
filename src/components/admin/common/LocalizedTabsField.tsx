"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Mode = "input" | "textarea" | "number";

interface BaseProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  pathKo: Path<T>;
  pathJa: Path<T>;
  placeholder?: string;
  rows?: number; // textarea
  mode?: Mode;
  errorKo?: string;
  errorJa?: string;

  /* 외부에서 ko/ja 탭을 제어하고 싶을 때 */
  activeLocale?: "ko" | "ja";
  onActiveLocaleChange?: (loc: "ko" | "ja") => void;

  autoSwitchOnError?: boolean;
}

export default function LocalizedTabsField<T extends FieldValues>({
  register,
  pathKo,
  pathJa,
  placeholder,
  rows = 3,
  mode = "input",
  errorKo,
  errorJa,
  activeLocale,
  onActiveLocaleChange,
  autoSwitchOnError = true,
}: BaseProps<T>) {
  const controlled = typeof activeLocale !== "undefined";
  const [tab, setTab] = React.useState<"ko" | "ja">("ko");
  const current = controlled ? activeLocale! : tab;

  const setCurrent = React.useCallback(
    (loc: "ko" | "ja") => {
      if (controlled) onActiveLocaleChange?.(loc);
      else setTab(loc);
    },
    [controlled, onActiveLocaleChange]
  );

  React.useEffect(() => {
    if (!autoSwitchOnError) return;
    if (errorJa && !errorKo && current !== "ja") setCurrent("ja");
    else if (errorKo && !errorJa && current !== "ko") setCurrent("ko");
  }, [autoSwitchOnError, errorKo, errorJa, current, setCurrent]);

  const commonNumberProps = {
    type: "number" as const,
    inputMode: "numeric" as const,
    pattern: "\\d*",
    min: 0,
    step: 1,
  };

  const KoField =
    mode === "textarea" ? (
      <Textarea
        rows={rows}
        {...register(pathKo)}
        placeholder={placeholder}
        aria-invalid={Boolean(errorKo) || undefined}
      />
    ) : mode === "number" ? (
      <Input
        {...commonNumberProps}
        {...register(pathKo, { valueAsNumber: true })}
        placeholder={placeholder}
        aria-invalid={Boolean(errorKo) || undefined}
      />
    ) : (
      <Input
        {...register(pathKo)}
        placeholder={placeholder}
        aria-invalid={Boolean(errorKo) || undefined}
      />
    );

  const JaField =
    mode === "textarea" ? (
      <Textarea
        rows={rows}
        {...register(pathJa)}
        placeholder={placeholder}
        aria-invalid={Boolean(errorJa) || undefined}
      />
    ) : mode === "number" ? (
      <Input
        {...commonNumberProps}
        {...register(pathJa, { valueAsNumber: true })}
        placeholder={placeholder}
        aria-invalid={Boolean(errorJa) || undefined}
      />
    ) : (
      <Input
        {...register(pathJa)}
        placeholder={placeholder}
        aria-invalid={Boolean(errorJa) || undefined}
      />
    );

  return (
    <Tabs value={current} onValueChange={(v) => setCurrent(v as "ko" | "ja")}>
      <TabsList className='mb-2'>
        <TabsTrigger value='ko'>
          한국어
          {errorKo ? (
            <span className='ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-600' />
          ) : null}
        </TabsTrigger>
        <TabsTrigger value='ja'>
          일본어
          {errorJa ? (
            <span className='ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-600' />
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value='ko' className='mt-0'>
        {KoField}
        {errorKo && <p className='mt-1 text-[11px] text-red-600'>{errorKo}</p>}
      </TabsContent>

      <TabsContent value='ja' className='mt-0'>
        {JaField}
        {errorJa && <p className='mt-1 text-[11px] text-red-600'>{errorJa}</p>}
      </TabsContent>
    </Tabs>
  );
}

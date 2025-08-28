"use client";
import React from "react";
import { useFormContext, type Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ClinicFormInput } from "../form-context";
import type { LocaleKey } from "@/constants/locales";
import { LOCALE_LABELS_KO } from "@/constants/locales";

export type LocalizedArrayBasePath =
  | "events"
  | "reservationNotices"
  | `doctors.${number}.lines`;

export default function LocalizedRepeaterFieldMulti(props: {
  basePath: LocalizedArrayBasePath;
  locales: readonly LocaleKey[];
  addLabel: string;
  removeLabel: string;
  placeholders: Record<LocaleKey, string>;
}) {
  const { basePath, locales, addLabel, removeLabel, placeholders } = props;
  const { register, setValue, watch } = useFormContext<ClinicFormInput>();

  // 탭 상태
  const [active, setActive] = React.useState<LocaleKey>(locales[0]);

  const valuesOf = (loc: LocaleKey): string[] => {
    const v = watch(`${basePath}.${loc}` as Path<ClinicFormInput>) as unknown;
    return Array.isArray(v) ? (v as string[]) : [];
  };

  const appendOne = (loc: LocaleKey) => {
    const cur = valuesOf(loc);
    const next = [...cur, ""];
    setValue(`${basePath}.${loc}` as Path<ClinicFormInput>, next, {
      shouldDirty: true,
    });
  };

  const removeAt = (loc: LocaleKey, index: number) => {
    const cur = valuesOf(loc);
    if (index < 0 || index >= cur.length) return;
    const next = [...cur.slice(0, index), ...cur.slice(index + 1)];
    setValue(`${basePath}.${loc}` as Path<ClinicFormInput>, next, {
      shouldDirty: true,
    });
  };

  return (
    <div className='px-5 py-4'>
      <Tabs value={active} onValueChange={(v) => setActive(v as LocaleKey)}>
        <TabsList className='mb-3'>
          {locales.map((loc) => (
            <TabsTrigger key={loc} value={loc}>
              {LOCALE_LABELS_KO[loc] ?? loc.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {locales.map((loc) => {
          const list = valuesOf(loc);
          return (
            <TabsContent key={loc} value={loc} className='mt-0'>
              <div className='space-y-3'>
                {list.map((_, i) => (
                  <div key={i} className='flex items-center gap-2'>
                    <Input
                      {...register(
                        `${basePath}.${loc}.${i}` as Path<ClinicFormInput>
                      )}
                      placeholder={placeholders[loc]}
                      className='h-9'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeAt(loc, i)}
                    >
                      {removeLabel}
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => appendOne(loc)}
                >
                  {addLabel}
                </Button>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

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
  const { register, setValue, watch, formState } =
    useFormContext<ClinicFormInput>();

  // 제출 버튼을 한 번이라도 눌렀는지 여부(경고 노출 트리거)
  const showWarnings = (formState.submitCount ?? 0) > 0;

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

  // 로케일별 "빈 항목 존재" 여부
  const hasEmptyByLocale = React.useMemo(() => {
    const map = new Map<LocaleKey, boolean>();
    locales.forEach((loc) => {
      const list = valuesOf(loc);
      map.set(
        loc,
        list.some((s) => (s ?? "").trim().length === 0)
      );
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locales, watch(basePath as Path<ClinicFormInput>)]);

  return (
    <div className='px-5 py-4'>
      <Tabs value={active} onValueChange={(v) => setActive(v as LocaleKey)}>
        <TabsList className='mb-3'>
          {locales.map((loc) => {
            const hasEmpty = hasEmptyByLocale.get(loc) === true;
            return (
              <TabsTrigger key={loc} value={loc}>
                {LOCALE_LABELS_KO[loc] ?? loc.toUpperCase()}
                {/* 제출 시점에 비어있는 항목이 있는 탭에 빨간 점 표시(경고) */}
                {showWarnings && hasEmpty && (
                  <span
                    aria-label='빈 항목 있음'
                    className='ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-600'
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {locales.map((loc) => {
          const list = valuesOf(loc);
          const isActive = active === loc;
          const hasEmptyHere = list.some((s) => (s ?? "").trim().length === 0);

          return (
            <TabsContent key={loc} value={loc} className='mt-0'>
              <div className='space-y-3'>
                {list.map((val, i) => {
                  const isEmpty = (val ?? "").trim().length === 0;
                  const showThisWarn = showWarnings && isActive && isEmpty;
                  return (
                    <div key={i} className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <Input
                          {...register(
                            `${basePath}.${loc}.${i}` as Path<ClinicFormInput>
                          )}
                          placeholder={placeholders[loc]}
                          className={
                            "h-9 " +
                            (showThisWarn
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "")
                          }
                          aria-invalid={showThisWarn || undefined}
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
                      {showThisWarn && (
                        <p className='text-[11px] text-red-600'>
                          비어 있으면 저장 시 자동 제거됩니다. 입력하거나
                          삭제하세요.
                        </p>
                      )}
                    </div>
                  );
                })}
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => appendOne(loc)}
                >
                  {addLabel}
                </Button>

                {/* 탭 하단에도 요약 경고(현재 탭 기준, 가시성 강화용) */}
                {showWarnings && isActive && hasEmptyHere && (
                  <p className='mt-1 text-[12px] text-red-600'>
                    이 탭에 비어 있는 항목이 있습니다. 불필요하면 삭제하세요.
                  </p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

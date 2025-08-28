"use client";

import { useFormContext } from "react-hook-form";
import type { Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ClinicFormInput } from "../form-context";
import type { LocaleKey } from "@/constants/locales";

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

  const valuesByLoc = locales.reduce<Record<LocaleKey, string[]>>(
    (acc, loc) => {
      const v = watch(
        `${basePath}.${loc}` as Path<ClinicFormInput>
      ) as unknown as string[] | undefined;
      acc[loc] = Array.isArray(v) ? v : [];
      return acc;
    },
    {} as Record<LocaleKey, string[]>
  );

  const length = Math.max(0, ...locales.map((loc) => valuesByLoc[loc].length));

  const appendAll = () => {
    locales.forEach((loc) => {
      const next = [...valuesByLoc[loc], ""];
      setValue(`${basePath}.${loc}` as Path<ClinicFormInput>, next, {
        shouldDirty: true,
      });
    });
  };

  const removeAll = (index: number) => {
    locales.forEach((loc) => {
      const cur = valuesByLoc[loc];
      if (index >= 0 && index < cur.length) {
        const next = [...cur.slice(0, index), ...cur.slice(index + 1)];
        setValue(`${basePath}.${loc}` as Path<ClinicFormInput>, next, {
          shouldDirty: true,
        });
      }
    });
  };

  return (
    <div className='space-y-3 px-5 py-4'>
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className='grid gap-3'
          style={{
            gridTemplateColumns: `repeat(${locales.length}, minmax(0, 1fr))`,
          }}
        >
          {locales.map((loc) => (
            <Input
              key={`${String(loc)}-${i}`}
              {...register(`${basePath}.${loc}.${i}` as Path<ClinicFormInput>)}
              defaultValue={valuesByLoc[loc][i] ?? ""}
              placeholder={placeholders[loc]}
            />
          ))}
          <div className='col-span-full flex justify-end'>
            <Button type='button' variant='ghost' onClick={() => removeAll(i)}>
              {removeLabel}
            </Button>
          </div>
        </div>
      ))}
      <Button type='button' variant='outline' onClick={appendAll}>
        {addLabel}
      </Button>
    </div>
  );
}

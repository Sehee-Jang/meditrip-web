"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCALES_TUPLE, type LocaleKey } from "@/constants/locales";
import type { ClinicFormInput } from "../form-context";
import LocalizedRepeaterFieldMulti from "./LocalizedRepeaterFieldMulti";

export default function DoctorsField() {
  const { control, register } = useFormContext<ClinicFormInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "doctors",
  });

  const placeholdersByLoc: Record<LocaleKey, { name: string; line: string }> = {
    ko: { name: "이름(한국어)", line: "경력/소개(한국어)" },
    ja: { name: "氏名(日本語)", line: "経歴/紹介(日本語)" },
    zh: { name: "姓名(中文)", line: "履历/介绍(中文)" },
    en: { name: "Name (EN)", line: "Career/Intro (EN)" },
  };

  const addOne = () =>
    append({
      name: Object.fromEntries(LOCALES_TUPLE.map((l) => [l, ""])) as Record<
        LocaleKey,
        string
      >,
      photoUrl: "",
      lines: Object.fromEntries(LOCALES_TUPLE.map((l) => [l, [""]])) as Record<
        LocaleKey,
        string[]
      >,
    });

  return (
    <div className='space-y-4 px-5 py-4'>
      {fields.map((f, i) => (
        <div key={f.id} className='rounded-md border p-4 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Input
              {...register(`doctors.${i}.photoUrl` as Path<ClinicFormInput>)}
              placeholder='사진 URL (https://...)'
            />
            <div />
          </div>

          <div
            className='grid gap-3'
            style={{
              gridTemplateColumns: `repeat(${LOCALES_TUPLE.length}, minmax(0, 1fr))`,
            }}
          >
            {LOCALES_TUPLE.map((loc) => (
              <Input
                key={`name-${String(loc)}`}
                {...register(
                  `doctors.${i}.name.${loc}` as Path<ClinicFormInput>
                )}
                placeholder={placeholdersByLoc[loc].name}
              />
            ))}
          </div>

          <LocalizedRepeaterFieldMulti
            basePath={`doctors.${i}.lines`}
            locales={LOCALES_TUPLE}
            addLabel='경력/소개 추가'
            removeLabel='삭제'
            placeholders={
              Object.fromEntries(
                LOCALES_TUPLE.map((loc) => [loc, placeholdersByLoc[loc].line])
              ) as Record<LocaleKey, string>
            }
          />

          <div className='flex justify-end'>
            <Button type='button' variant='ghost' onClick={() => remove(i)}>
              의료진 제거
            </Button>
          </div>
        </div>
      ))}
      <Button type='button' variant='outline' onClick={addOne}>
        의료진 추가
      </Button>
    </div>
  );
}

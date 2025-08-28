"use client";

import { useFieldArray, useFormContext, type Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LOCALES_TUPLE, type LocaleKey } from "@/constants/locales";
import type { ClinicFormInput } from "../form-context";
import LocalizedRepeaterFieldMulti from "./LocalizedRepeaterFieldMulti";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import FormRow from "@/components/admin/common/FormRow";

export default function DoctorsField() {
  const { control, register, setValue, watch, formState } =
    useFormContext<ClinicFormInput>();
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
      {fields.map((f, i) => {
        const photo =
          (watch(`doctors.${i}.photoUrl` as Path<ClinicFormInput>) as
            | string
            | undefined) ?? "";

        return (
          <div key={f.id} className='rounded-lg border p-4 space-y-5'>
            {/* 1) 이름 (탭형) */}
            <FormRow
              label='이름'
              control={
                <LocalizedTabsField
                  register={register}
                  basePath={`doctors.${i}.name` as Path<ClinicFormInput>}
                  locales={LOCALES_TUPLE}
                  errors={formState.errors}
                  placeholder={placeholdersByLoc.ko.name}
                  mode='input'
                />
              }
            />

            {/* 2) 프로필 사진 (파일 첨부 업로더) */}
            <FormRow
              label='프로필 사진'
              control={
                <ImagesUploader
                  value={photo ? [photo] : []}
                  onChange={(urls) =>
                    setValue(
                      `doctors.${i}.photoUrl` as Path<ClinicFormInput>,
                      urls[0] ?? "",
                      { shouldDirty: true }
                    )
                  }
                  preset='clinics'
                  multiple={false}
                  accept='image/*'
                />
              }
            />

            {/* 3) 경력/소개 (탭형 반복 입력) */}
            <FormRow
              label='경력/소개'
              control={
                <LocalizedRepeaterFieldMulti
                  basePath={`doctors.${i}.lines`}
                  locales={LOCALES_TUPLE}
                  addLabel='경력/소개 추가'
                  removeLabel='삭제'
                  placeholders={
                    Object.fromEntries(
                      LOCALES_TUPLE.map((loc) => [
                        loc,
                        placeholdersByLoc[loc].line,
                      ])
                    ) as Record<LocaleKey, string>
                  }
                />
              }
            />

            {/* 카드 하단 액션 */}
            <div className='flex justify-end'>
              <Button type='button' variant='ghost' onClick={() => remove(i)}>
                의료진 제거
              </Button>
            </div>
          </div>
        );
      })}

      <Button type='button' variant='outline' onClick={addOne}>
        의료진 추가
      </Button>
    </div>
  );
}

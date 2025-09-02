"use client";

import React, { useRef } from "react";
import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import { wellnessFormSchema } from "@/validations/wellness";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWellness } from "@/services/wellness/createWellness";
import { updateWellness } from "@/services/wellness/updateWellness";
import type {
  CreateWellnessInput,
  UpdateWellnessInput,
} from "@/types/wellness";
import {
  CATEGORY_LABELS_KO,
  type CategoryKey,
  Category,
  CATEGORIES,
} from "@/constants/categories";
import { LOCALES_TUPLE } from "@/constants/locales";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WellnessFormDialogProps {
  id: string; // 빈 문자열이면 create
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
}

type FormIn = z.input<typeof wellnessFormSchema>;
type FormOut = z.output<typeof wellnessFormSchema>;

export default function WellnessFormDialog({
  id,
  open,
  onOpenChange,
  onCreated,
  onUpdated,
}: WellnessFormDialogProps) {
  const mode: "create" | "edit" = id ? "edit" : "create";
  const formId = "wellness-form";
  const submittingRef = useRef<boolean>(false);
  const formElRef = useRef<HTMLFormElement | null>(null);
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver<FormIn, unknown, FormOut>(wellnessFormSchema),
    defaultValues: {
      // ko/ja 필수, zh/en 선택 — 탭 UX를 위해 키를 미리 포함
      title: { ko: "", ja: "", zh: "", en: "" },
      excerpt: { ko: "", ja: "", zh: "", en: "" },
      body: { ko: "", ja: "", zh: "", en: "" },
      // category: "stress" as CategoryKey,
      tags: [],
      images: [],
      isHidden: false, // 생성 폼에서는 노출하지 않음
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, reset, watch } = form;

  /** 첫 invalid 필드로 스크롤/포커스 */
  const focusFirstInvalid = (): void => {
    const el = formElRef.current;
    if (!el) return;
    const invalid = el.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const onSubmit: SubmitHandler<FormOut> = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      // 현재 DB는 단일 문자열 저장 → ko 기준으로 저장
      const payloadBase = {
        title: values.title,
        excerpt: values.excerpt,
        body: values.body,
        category: values.category,
        tags: values.tags,
        images: values.images ?? [],
        isHidden: values.isHidden,
      };

      if (mode === "create") {
        const input: CreateWellnessInput = payloadBase;
        await createWellness(input);
        onCreated?.();
        reset();
      } else {
        const patch: UpdateWellnessInput = payloadBase;
        await updateWellness(id, patch);
        onUpdated?.();
      }
      onOpenChange(false);
    } finally {
      submittingRef.current = false;
    }
  };

  const onInvalid = (): void => {
    requestAnimationFrame(focusFirstInvalid);
  };

  const images = watch("images") ?? [];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "등록" : "수정"}
      description='필수 정보를 입력하세요.'
      formId={formId}
      submitLabel={mode === "create" ? "등록" : "수정"}
      widthClassName='sm:max-w-[860px]'
    >
      <form
        id={formId}
        ref={formElRef}
        className='space-y-6'
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >
        {/* 기본 정보 */}
        <SectionCard title='기본 정보'>
          <FormRow
            label='제목'
            control={
              <LocalizedTabsField
                register={register}
                basePath='title'
                locales={LOCALES_TUPLE} // ko/ja/zh/en
                placeholder='제목을 입력하세요'
                mode='input'
                errors={formState.errors}
              />
            }
          />

          <FormRow
            label='요약'
            control={
              <LocalizedTabsField
                register={register}
                basePath='excerpt'
                locales={LOCALES_TUPLE}
                placeholder='목록에 표시될 설명문'
                mode='input'
                errors={formState.errors}
              />
            }
          />

          <FormRow
            label='카테고리'
            control={
              <Controller
                name='category'
                control={form.control}
                // RHF defaultValues.category가 초기값의 단일 출처가 됨
                render={({ field, fieldState }) => (
                  <div>
                    <Select
                      value={(field.value as string | undefined) ?? undefined}
                      onValueChange={(v) => field.onChange(v as Category)}
                    >
                      <SelectTrigger
                        aria-invalid={!!fieldState.error}
                        aria-describedby='category-error'
                        className='h-9'
                      >
                        <SelectValue placeholder='카테고리를 선택하세요' />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORIES).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {CATEGORY_LABELS_KO[key as CategoryKey]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {typeof fieldState.error?.message === "string" && (
                      <p
                        id='category-error'
                        className='mt-1 text-[11px] text-red-600'
                      >
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            }
          />
        </SectionCard>

        {/* 내용 */}
        <SectionCard title='내용' description='내용을 입력해주세요.'>
          <FormRow
            label='본문'
            control={
              <LocalizedTabsField
                register={register}
                basePath='body'
                locales={LOCALES_TUPLE}
                placeholder='내용을 입력하세요.'
                mode='textarea'
                errors={formState.errors}
              />
            }
          />
        </SectionCard>

        {/* 이미지 */}
        <SectionCard title='이미지' description='대표 이미지를 업로드하세요.'>
          <FormRow
            label='대표 이미지'
            control={
              <ImagesUploader
                value={images}
                onChange={(urls: string[]) =>
                  setValue("images", urls, { shouldDirty: true })
                }
                dir='wellness'
              />
            }
          />
        </SectionCard>
      </form>
    </FormSheet>
  );
}

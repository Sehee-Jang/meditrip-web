"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import { z } from "zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { articlesFormSchema } from "@/validations/articles";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  Article,
} from "@/types/articles";
import { createArticle } from "@/services/articles/createArticle";
import { updateArticle } from "@/services/articles/updateArticle";
import { getArticleById } from "@/services/articles/getArticleById";

import {
  CATEGORY_LABELS_KO,
  type CategoryKey,
  Category,
  CATEGORIES,
} from "@/constants/categories";
import { LOCALES_TUPLE, type LocaleKey } from "@/constants/locales";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import EditorClient from "@/components/editor/EditorClient";
import type { JSONContent } from "@tiptap/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArticlesFormDialogProps {
  id: string; // 빈 문자열이면 create
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
}

// 빈 문서(Tiptap JSON)
const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

// JSONContent 형태 체크
function isJSONContent(v: unknown): v is JSONContent {
  return (
    !!v && typeof v === "object" && (v as { type?: unknown }).type === "doc"
  );
}

export default function ArticlesFormDialog({
  id,
  open,
  onOpenChange,
  onCreated,
  onUpdated,
}: ArticlesFormDialogProps) {
  const mode: "create" | "edit" = id ? "edit" : "create";
  const formId = "articles-form";
  const submittingRef = useRef<boolean>(false);
  const formElRef = useRef<HTMLFormElement | null>(null);

  type FormIn = z.input<typeof articlesFormSchema>;
  type FormOut = z.output<typeof articlesFormSchema>;

  // RHF 초기화
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver<FormIn, unknown, FormOut>(articlesFormSchema),
    defaultValues: {
      title: { ko: "", ja: "", zh: "", en: "" },
      excerpt: { ko: "", ja: "", zh: "", en: "" },
      body: { ko: EMPTY_DOC, ja: EMPTY_DOC, zh: EMPTY_DOC, en: EMPTY_DOC }, // FormIn: JSONContent | undefined OK
      tags: [],
      images: [],
      isHidden: false,
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, control, reset, watch } =
    form;

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (!open || mode !== "edit" || !id) return;

    (async () => {
      const data: Article | null = await getArticleById(id);
      if (!data) return;

      // 안전하게 각 로케일별 본문 보정
      const bodyByLocale: Record<LocaleKey, JSONContent> = LOCALES_TUPLE.reduce(
        (acc, loc) => {
          const v = data.body?.[loc];
          acc[loc] = isJSONContent(v) ? v : EMPTY_DOC;
          return acc;
        },
        {
          ko: EMPTY_DOC,
          ja: EMPTY_DOC,
          zh: EMPTY_DOC,
          en: EMPTY_DOC,
        } as Record<LocaleKey, JSONContent>
      );

      reset({
        title: data.title, // Record<LocaleKey, string>
        excerpt: data.excerpt, // Record<LocaleKey, string>
        body: bodyByLocale, // Record<LocaleKey, JSONContent>
        category: data.category,
        tags: data.tags ?? [],
        images: data.images ?? [],
        isHidden: data.isHidden ?? false,
      });
    })();
  }, [open, mode, id, reset]);

  // 첫 invalid 필드로 포커스
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
      const base = {
        title: values.title,
        excerpt: values.excerpt,
        body: values.body,
        category: values.category,
        tags: values.tags,
        images: values.images ?? [],
        isHidden: values.isHidden,
      };

      if (mode === "create") {
        const input: CreateArticleInput = base;
        await createArticle(input);
        onCreated?.();
        reset();
      } else {
        const patch: UpdateArticleInput = base;
        await updateArticle(id, patch);
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
      title={mode === "create" ? "아티클 등록" : "아티클 수정"}
      description='필수 정보를 입력하세요.'
      formId={formId}
      submitLabel={mode === "create" ? "등록" : "수정"}
      widthClassName='sm:max-w-[880px]'
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
                locales={LOCALES_TUPLE}
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
                control={control}
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

        {/* 본문(Tiptap) */}
        <SectionCard title='본문' description='언어별로 본문을 입력하세요.'>
          <Tabs defaultValue='ko' className='w-full'>
            <TabsList className='mb-3'>
              {LOCALES_TUPLE.map((loc) => (
                <TabsTrigger key={loc} value={loc}>
                  {loc.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>

            {LOCALES_TUPLE.map((loc) => (
              <TabsContent key={loc} value={loc} className='mt-0'>
                <Controller
                  name={`body.${loc}`}
                  control={control}
                  render={({ field }) => (
                    <EditorClient
                      value={
                        isJSONContent(field.value) ? field.value : EMPTY_DOC
                      }
                      onChange={(doc) => field.onChange(doc)} // doc: JSONContent
                      placeholder={`(${loc.toUpperCase()}) 본문을 입력하세요…`}
                    />
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>
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
                dir='articles'
              />
            }
          />
        </SectionCard>
      </form>
    </FormSheet>
  );
}

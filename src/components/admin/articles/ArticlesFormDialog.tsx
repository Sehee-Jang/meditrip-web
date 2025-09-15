"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import FormSheet from "@/components/admin/common/FormSheet";
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
import type { JSONContent } from "@tiptap/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

/* -------------------------------------------------------------------------- */
/* 유틸                                                                        */
/* -------------------------------------------------------------------------- */

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function isJSONContent(v: unknown): v is JSONContent {
  return (
    !!v && typeof v === "object" && (v as { type?: unknown }).type === "doc"
  );
}

async function uploadArticleImage(file: File): Promise<string> {
  const key = `articles/body/${Date.now()}_${encodeURIComponent(file.name)}`;
  const storageRef = ref(storage, key);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return await getDownloadURL(storageRef);
}

/* -------------------------------------------------------------------------- */
/* 메인 다이얼로그                                                             */
/* -------------------------------------------------------------------------- */

interface ArticlesFormDialogProps {
  id: string; // 빈 문자열이면 create
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
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

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver<FormIn, unknown, FormOut>(articlesFormSchema),
    defaultValues: {
      title: { ko: "", ja: "", zh: "", en: "" },
      excerpt: { ko: "", ja: "", zh: "", en: "" },
      body: { ko: EMPTY_DOC, ja: EMPTY_DOC, zh: EMPTY_DOC, en: EMPTY_DOC },
      category: undefined,
      tags: [],
      images: [],
      isHidden: false,
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, control, reset, watch } =
    form;

  // 편집 모드 데이터 로드
  useEffect(() => {
    if (!open || mode !== "edit" || !id) return;
    (async () => {
      const data: Article | null = await getArticleById(id);
      if (!data) return;

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
        title: data.title,
        excerpt: data.excerpt,
        body: bodyByLocale,
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
        await createArticle(base as CreateArticleInput);
        onCreated?.();
        reset();
      } else {
        await updateArticle(id, base as UpdateArticleInput);
        onUpdated?.();
      }
      onOpenChange(false);
    } finally {
      submittingRef.current = false;
    }
  };

  const onInvalid = (): void => {
    requestAnimationFrame(() => {
      focusFirstInvalid();
    });
  };

  const images = watch("images") ?? [];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "아티클 등록" : "아티클 수정"}
      description='필수 정보를 입력하세요.'
      formId={formId}
      submitLabel='저장'
      widthClassName='sm:max-w-[960px]'
      submitDisabled={formState.isSubmitting}
    >
      {/* 작성 레이아웃 */}
      <form
        id={formId}
        ref={formElRef}
        className='space-y-6'
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >
        {/* 상단 헤더: 카테고리 + 큰 제목 */}
        <div className='flex flex-col gap-3 border-b pb-4'>
          <div className='w-52'>
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
                      className='h-9'
                    >
                      <SelectValue placeholder='카테고리' />
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
                    <p className='mt-1 text-[11px] text-red-600'>
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <LocalizedTabsField
              register={register}
              basePath='title'
              locales={LOCALES_TUPLE}
              placeholder='제목을 입력하세요'
              mode='input'
              errors={formState.errors}
            />
          </div>
        </div>

        {/* 본문 편집기(언어 탭 + Tiptap + 이미지 첨부 업로드) */}
        <div className='space-y-3'>
          <Tabs defaultValue='ko' className='w-full'>
            <TabsList className='mb-3'>
              {LOCALES_TUPLE.map((loc) => (
                <TabsTrigger key={loc} value={loc}>
                  {loc.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>

            {LOCALES_TUPLE.map((loc) => (
              <TabsContent key={loc} value={loc} className='mt-0 space-y-3'>
                <Controller
                  name={`body.${loc}`}
                  control={control}
                  render={({ field }) => (
                    <SimpleEditor
                      value={
                        isJSONContent(field.value) ? field.value : EMPTY_DOC
                      }
                      onChange={(doc) => field.onChange(doc)}
                      onUploadImage={uploadArticleImage}
                      placeholder={`(${loc.toUpperCase()}) 본문을 입력하세요…`}
                      minHeight={480}
                    />
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* 요약 + 태그 + 대표 이미지 */}
        <div className='space-y-4'>
          <div>
            <LocalizedTabsField
              register={register}
              basePath='excerpt'
              locales={LOCALES_TUPLE}
              placeholder='목록에 표시될 설명문'
              mode='input'
              errors={formState.errors}
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>태그</label>
            <Controller
              name='tags'
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value ?? []}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>
              대표 이미지
            </label>
            <ImagesUploader
              value={images}
              onChange={(urls: string[]) =>
                setValue("images", urls, { shouldDirty: true })
              }
              dir='articles'
            />
          </div>
        </div>
      </form>
    </FormSheet>
  );
}

/* -------------------------------------------------------------------------- */
/* 태그 인풋 (칩)                                                              */
/* -------------------------------------------------------------------------- */
function TagsInput({
  value,
  onChange,
  placeholder = "#태그입력",
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setInput("");
  };

  const removeTag = (t: string) => onChange(value.filter((x) => x !== t));

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input.length === 0 && value.length) {
      e.preventDefault();
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      className={[
        "min-h-10 w-full rounded-md border px-2 py-1.5",
        "flex flex-wrap items-center gap-1",
        className ?? "",
      ].join(" ")}
    >
      {value.map((t) => (
        <span
          key={t}
          className='inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs'
        >
          #{t}
          <button
            type='button'
            aria-label={`${t} 태그 제거`}
            className='text-gray-500'
            onClick={() => removeTag(t)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={value.length === 0 ? placeholder : undefined}
        className='flex-1 min-w-[120px] border-0 bg-transparent outline-none text-sm'
      />
    </div>
  );
}

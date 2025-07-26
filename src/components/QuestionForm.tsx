"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Image from "next/image";
import { createQuestion } from "@/services/questions/createQuestion";
import { useDropzone } from "react-dropzone";

// i18n 번역 스키마 설정
const formSchema = z.object({
  title: z.string().min(2),
  category: z.enum(["stress", "diet", "immunity", "women", "antiaging", "etc"]),
  content: z.string().min(10),
  file: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function QuestionForm({ userId }: { userId: string }) {
  const t = useTranslations("question-form");
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      const file = accepted[0];
      setValue("file", file); // react-hook-form과 연동
      setPreview(URL.createObjectURL(file));
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const file = data.file?.[0];
      await createQuestion({
        title: data.title,
        category: data.category,
        content: data.content,
        file,
        userId,
      });
      alert(t("submit") + " 완료!");
      reset();
      setPreview(null);
    } catch (e) {
      console.error(e);
      alert("등록에 실패했습니다.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <section className='max-w-4xl mx-auto px-4 py-6'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6'
      >
        <div className='text-center'>
          <h2 className='text-xl md:text-2xl font-bold'>{t("subtitle")}</h2>
        </div>

        {/* 제목 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.title.label")}
          </label>
          <input
            {...register("title")}
            placeholder={t("form.title.placeholder")}
            className='w-full p-3 border rounded-md'
          />
          <p className='text-xs text-gray-400 mt-1'>{t("form.title.max")}</p>
          {errors.title && (
            <p className='text-red-500 text-sm mt-1'>
              {t("form.title.placeholder")}
            </p>
          )}
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.category.label")}
          </label>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(
              t.raw("form.category.options") as Record<string, string>
            ).map(([key, value]) => (
              <label
                key={key}
                className='border px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-100'
              >
                <input
                  type='radio'
                  value={key}
                  {...register("category")}
                  className='mr-1'
                />
                {value}
              </label>
            ))}
          </div>
          {errors.category && (
            <p className='text-red-500 text-sm mt-1'>
              {t("form.category.placeholder")}
            </p>
          )}
        </div>

        {/* 질문 내용 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.content.label")}
          </label>
          <textarea
            {...register("content")}
            placeholder={t("form.content.placeholder")}
            className='w-full p-3 border rounded-md min-h-[120px]'
          />
          <p className='text-xs text-gray-400 mt-1'>{t("form.content.max")}</p>
          {errors.content && (
            <p className='text-red-500 text-sm mt-1'>
              {t("form.content.placeholder")}
            </p>
          )}
        </div>

        {/* 사진 업로드 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.image.label")}
          </label>

          {/* 사진 첨부 */}
          <input
            type='file'
            accept='image/*'
            {...register("file")}
            onChange={handleFileChange}
            className='block w-full'
          />

          {/* 사진 드롭존 */}
          <div
            {...getRootProps()}
            className='border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50'
          >
            <input {...getInputProps()} />
            {preview ? (
              <Image
                src={preview}
                alt='preview'
                width={300}
                height={200}
                className='mx-auto rounded'
              />
            ) : (
              <p className='text-gray-500 text-sm'>
                {
                  t(
                    "form.image.helper"
                  ) /* 예: 사진을 드래그 앤 드롭하거나 파일을 선택해 업로드해 주세요. */
                }
              </p>
            )}
          </div>
        </div>

        <div className='bg-gray-50 border px-4 py-3 rounded-md'>
          <p className='font-semibold text-sm'>{t("pointInfo.title")}</p>
          <p className='text-sm text-gray-600 mt-1'>
            {t("pointInfo.description")}
          </p>
        </div>

        <div className='flex justify-end gap-2'>
          <button
            type='button'
            className='border border-gray-400 text-gray-700 py-2 px-4 rounded-md'
            onClick={() => {
              reset();
              setPreview(null);
            }}
          >
            취소
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800'
          >
            {isSubmitting ? t("submit") + "..." : t("submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

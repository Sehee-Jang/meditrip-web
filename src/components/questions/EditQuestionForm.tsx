"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Question } from "@/types/question";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { updateQuestion } from "@/services/questions/updateQuestion";
import CommonButton from "../common/CommonButton";

const formSchema = z.object({
  title: z.string().min(2),
  category: z.enum(["stress", "diet", "immunity", "women", "antiaging", "etc"]),
  content: z.string().min(1),
  file: z.array(z.instanceof(File)).max(1).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditQuestionForm({ question }: { question: Question }) {
  const t = useTranslations("question-form");
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(
    question.imageUrl || null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: question.title,
      category: question.category as FormData["category"],
      content: question.content,
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (accepted) => {
      const file = accepted[0];
      if (!file) return;
      setValue("file", accepted, { shouldDirty: true, shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("file", [file], { shouldDirty: true, shouldValidate: true });
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    try {
      await updateQuestion({
        id: question.id,
        title: data.title,
        category: data.category,
        content: data.content,
        file: data.file?.[0],
      });

      router.push(`/community/questions/${question.id}`);
    } catch (err) {
      alert("수정에 실패했습니다.");
      console.error(err);
    }
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
            className='w-full p-3 border rounded-md'
          />
          {errors.title && (
            <p className='text-red-500 text-sm'>
              {t("form.title.placeholder")}
            </p>
          )}
        </div>

        {/* 카테고리 */}
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
                className='border px-3 py-1 rounded-full text-sm cursor-pointer'
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
            <p className='text-red-500 text-sm'>
              {t("form.category.placeholder")}
            </p>
          )}
        </div>

        {/* 내용 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.content.label")}
          </label>
          <textarea
            {...register("content")}
            className='w-full p-3 border rounded-md min-h-[120px]'
          />
          {errors.content && (
            <p className='text-red-500 text-sm'>
              {t("form.content.placeholder")}
            </p>
          )}
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.image.label")}
          </label>

          <input type='file' accept='image/*' onChange={handleFileChange} />
          <div
            {...getRootProps()}
            className='border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 mt-2'
          >
            <input {...getInputProps()} />
            {preview ? (
              <Image
                src={preview}
                alt='이미지 미리보기'
                width={300}
                height={200}
                className='mx-auto rounded'
              />
            ) : (
              <p className='text-gray-500 text-sm'>{t("form.image.helper")}</p>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className='flex justify-end gap-2'>
          <CommonButton
            type='button'
            className='bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            onClick={() => router.push(`/community/questions/${question.id}`)}
          >
            {t("cancel")}
          </CommonButton>
          <CommonButton type='submit' disabled={isSubmitting}>
            {isSubmitting ? t("submit.edit") + "..." : t("submit.edit")}
          </CommonButton>
        </div>
      </form>
    </section>
  );
}

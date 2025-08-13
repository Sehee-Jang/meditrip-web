"use client";

import { useState } from "react";
import Image from "next/image";

import { useRouter } from "@/i18n/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { auth } from "@/lib/firebase";
import { createQuestion } from "@/services/questions/createQuestion";
import { awardPointsIfEligible } from "@/services/points/awardPointsIfEligible";
import {
  COMMUNITY_CATEGORY_VALUES,
  COMMUNITY_CATEGORY_KEYS,
} from "@/constants/communityCategories";
import type { CommunityCategory, CommunityCategoryKey } from "@/types/category";

export default function QuestionForm() {
  const t = useTranslations("question-form");
  const tToast = useTranslations("question-toast");
  const router = useRouter();

  const formSchema = z.object({
    title: z.string().min(2, { message: t("form.content.errors.titleMin") }),
    category: z.enum(
      COMMUNITY_CATEGORY_VALUES as [CommunityCategory, ...CommunityCategory[]]
    ),
    content: z
      .string()
      .min(1, { message: t("form.content.errors.contentRequired") }),
    file: z.array(z.instanceof(File)).max(1).optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
    mode: "onBlur",
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      // RHF 값은 항상 File[] 형태로 유지
      setValue("file", accepted, { shouldDirty: true, shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    },
  });

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    const file = fl?.[0];
    if (file && fl) {
      setValue("file", Array.from(fl), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        toast.error(tToast("loginRequired"));
        return;
      }

      const newId = await createQuestion({
        title: data.title,
        category: data.category,
        content: data.content,
        file: data.file?.[0],
      });

      // 포인트 이벤트 연동 (존재하는 경우)
      await awardPointsIfEligible({
        userId: uid,
        triggerType: "community_post",
      });

      toast.success(tToast("success"));
      reset();
      setPreview(null);
      router.push(`/community/questions/${newId}`);
    } catch (err) {
      console.error(err);
      toast.error(tToast("failed"));
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
            placeholder={t("form.title.placeholder")}
            className='w-full p-3 border rounded-md'
          />
          <p className='text-xs text-gray-400 mt-1'>{t("form.title.max")}</p>
          {errors.title?.message && (
            <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.category.label")}
          </label>
          <div className='flex flex-wrap gap-2'>
            {COMMUNITY_CATEGORY_KEYS.map((key: CommunityCategoryKey) => (
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
                {t(`form.category.options.${key}`)}
              </label>
            ))}
          </div>
          {errors.category?.message && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.category.message}
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
            placeholder={t("form.content.placeholder")}
            className='w-full p-3 border rounded-md min-h-[120px]'
          />
          <p className='text-xs text-gray-400 mt-1'>{t("form.content.max")}</p>
          {errors.content?.message && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.content.message}
            </p>
          )}
        </div>

        {/* 이미지 업로드: 파일 입력 + 드롭존 */}
        <div>
          <label className='block font-medium mb-1'>
            {t("form.image.label")}
          </label>

          <input
            type='file'
            accept='image/*'
            onChange={onChangeFile}
            className='block w-full'
          />

          <div
            {...getRootProps()}
            className='border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 mt-3'
          >
            <input {...getInputProps()} />
            {preview ? (
              <Image
                src={preview}
                alt={t("form.image.previewAlt")}
                width={300}
                height={200}
                className='mx-auto rounded'
              />
            ) : (
              <p className='text-gray-500 text-sm'>{t("form.image.helper")}</p>
            )}
          </div>
        </div>

        {/* 포인트 안내 */}
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
            onClick={() => router.push("/community")}
          >
            {t("cancel")}
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800'
          >
            {isSubmitting ? `${t("submit.create")}...` : t("submit.create")}
          </button>
        </div>
      </form>
    </section>
  );
}

"use client";

import { useRouter } from "@/i18n/navigation";

import { toast } from "sonner";

import { auth } from "@/lib/firebase";
import { createQuestion } from "@/services/questions/createQuestion";

import { awardViaApi } from "@/services/points/awardViaApi";
import QuestionFormFields from "./QuestionFormFields";
import {
  useQuestionForm,
  type QuestionFormValues,
} from "../../hooks/useQuestionForm";

export default function QuestionForm() {
  const router = useRouter();

  const {
    form,
    preview,
    resetPreview,
    getRootProps,
    getInputProps,
    handleFileChange,
    copy,
    categoryOptions,
    tToast,
  } = useQuestionForm({ mode: "onBlur" });

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: QuestionFormValues) => {
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

      // 포인트 적립(서버 위임)
      try {
        await awardViaApi({ triggerType: "community_post", subjectId: newId });
      } catch (e) {
        console.warn("[points] award failed:", e);
      }

      toast.success(tToast("success"));
      reset();
      resetPreview();
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
          <h2 className='text-xl md:text-2xl font-bold'>{copy.subtitle}</h2>
        </div>

        <QuestionFormFields
          register={register}
          errors={errors}
          copy={copy}
          categoryOptions={categoryOptions}
          preview={preview}
          onFileChange={handleFileChange}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          showGuideTexts
          fileInputClassName='block w-full'
          dropzoneClassName='mt-3'
          categoryOptionClassName='hover:bg-gray-100'
        />

        {/* 포인트 안내 */}
        <div className='bg-gray-50 border px-4 py-3 rounded-md'>
          <p className='font-semibold text-sm'>{copy.pointInfo.title}</p>
          <p className='text-sm text-gray-600 mt-1'>
            {copy.pointInfo.description}
          </p>
        </div>

        <div className='flex justify-end gap-2'>
          <button
            type='button'
            className='border border-gray-400 text-gray-700 py-2 px-4 rounded-md'
            onClick={() => router.push("/community")}
          >
            {copy.cancel}
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800'
          >
            {isSubmitting ? `${copy.submit.create}...` : copy.submit.create}
          </button>
        </div>
      </form>
    </section>
  );
}

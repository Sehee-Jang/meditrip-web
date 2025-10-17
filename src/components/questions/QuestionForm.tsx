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
import {
  FILE_TOO_LARGE_ERROR_CODE,
  MAX_UPLOAD_FILE_SIZE_LABEL,
} from "@/constants/uploads";

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
      if (err instanceof Error && err.message === FILE_TOO_LARGE_ERROR_CODE) {
        toast.error(
          tToast("fileTooLarge", { size: MAX_UPLOAD_FILE_SIZE_LABEL })
        );
        return;
      }
      console.error(err);
      toast.error(tToast("failed"));
    }
  };

  return (
    <section className='mx-auto max-w-4xl px-4 py-6'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='mx-auto w-full max-w-2xl space-y-6 rounded-none px-4 py-10 md:px-8'
      >
        <div className='text-center'>
          <h2 className='text-xl font-bold md:text-2xl'>{copy.subtitle}</h2>
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
          categoryOptionClassName='hover:bg-accent hover:text-accent-foreground'
        />

        {/* 포인트 안내 */}
        <div className='rounded-md border border-border bg-muted px-4 py-3'>
          <p className='text-sm font-semibold'>{copy.pointInfo.title}</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            {copy.pointInfo.description}
          </p>
        </div>

        <div className='flex justify-end gap-2'>
          {/* 취소: 중립 버튼 */}
          <button
            type='button'
            className='rounded-md border border-border bg-card px-4 py-2 text-sm text-card-foreground
                       hover:bg-accent hover:text-accent-foreground
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            onClick={() => router.push("/community")}
          >
            {copy.cancel}
          </button>

          {/* 제출: 프라이머리 */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='rounded-md bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground
                       hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            {isSubmitting ? `${copy.submit.create}...` : copy.submit.create}
          </button>
        </div>
      </form>
    </section>
  );
}

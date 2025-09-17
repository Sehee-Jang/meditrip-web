"use client";
import { toast } from "sonner";
import { Question } from "@/types/question";
import CommonButton from "../common/CommonButton";
import QuestionFormFields from "./QuestionFormFields";
import {
  useQuestionForm,
  type QuestionFormValues,
} from "../../hooks/useQuestionForm";
import { useRouter } from "@/i18n/navigation";
import { updateQuestion } from "@/services/questions/updateQuestion";

export default function EditQuestionForm({ question }: { question: Question }) {
  const router = useRouter();
  const {
    form,
    preview,
    getRootProps,
    getInputProps,
    handleFileChange,
    copy,
    categoryOptions,
    tToast,
  } = useQuestionForm({
    defaultValues: {
      title: question.title,
      category: question.category as QuestionFormValues["category"],
      content: question.content,
    },
    initialPreview: question.imageUrl ?? null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: QuestionFormValues) => {
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
      console.error(err);
      toast.error(tToast("editFailed"));
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
          showGuideTexts={false}
          dropzoneClassName='mt-2'
        />

        {/* 버튼 */}
        <div className='flex justify-end gap-2'>
          <CommonButton
            type='button'
            className='bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            onClick={() => router.push(`/community/questions/${question.id}`)}
          >
            {copy.cancel}
          </CommonButton>
          <CommonButton type='submit' disabled={isSubmitting}>
            {isSubmitting ? copy.submit.edit + "..." : copy.submit.edit}
          </CommonButton>
        </div>
      </form>
    </section>
  );
}

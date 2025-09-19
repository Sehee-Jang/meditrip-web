"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { DropzoneState } from "react-dropzone";

import type {
  QuestionCategoryOption,
  QuestionFormCopy,
  QuestionFormValues,
} from "../../hooks/useQuestionForm";

interface QuestionFormFieldsProps {
  register: UseFormRegister<QuestionFormValues>;
  errors: FieldErrors<QuestionFormValues>;
  copy: QuestionFormCopy;
  categoryOptions: QuestionCategoryOption[];
  preview: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  getRootProps: DropzoneState["getRootProps"];
  getInputProps: DropzoneState["getInputProps"];
  showGuideTexts?: boolean;
  fileInputClassName?: string;
  dropzoneClassName?: string;
  categoryOptionClassName?: string;
}

export default function QuestionFormFields({
  register,
  errors,
  copy,
  categoryOptions,
  preview,
  onFileChange,
  getRootProps,
  getInputProps,
  showGuideTexts = true,
  fileInputClassName,
  dropzoneClassName,
  categoryOptionClassName,
}: QuestionFormFieldsProps) {
  const dropzoneSpacing = dropzoneClassName ?? "mt-3";
  const categoryClassName =
    `border px-3 py-1 rounded-full text-sm cursor-pointer ${
      categoryOptionClassName ?? ""
    }`.trim();

  return (
    <>
      <div>
        <label className='block font-medium mb-1'>
          {copy.form.title.label}
        </label>
        <input
          {...register("title")}
          placeholder={copy.form.title.placeholder}
          className='w-full p-3 border rounded-md'
        />
        {showGuideTexts && (
          <p className='text-xs text-muted-foreground mt-1'>
            {copy.form.title.max}
          </p>
        )}
        {errors.title?.message && (
          <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className='block font-medium mb-1'>
          {copy.form.category.label}
        </label>
        <div className='flex flex-wrap gap-2'>
          {categoryOptions.map((option) => (
            <label key={option.key} className={categoryClassName}>
              <input
                type='radio'
                value={option.value}
                {...register("category")}
                className='mr-1'
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.category && (
          <p className='text-red-500 text-sm mt-1'>
            {errors.category.message ?? copy.form.category.placeholder}
          </p>
        )}
      </div>

      <div>
        <label className='block font-medium mb-1'>
          {copy.form.content.label}
        </label>
        <textarea
          {...register("content")}
          placeholder={copy.form.content.placeholder}
          className='w-full p-3 border rounded-md min-h-[120px]'
        />
        {showGuideTexts && (
          <p className='text-xs text-muted-foreground mt-1'>
            {copy.form.content.max}
          </p>
        )}
        {errors.content?.message && (
          <p className='text-red-500 text-sm mt-1'>{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className='block font-medium mb-1'>
          {copy.form.image.label}
        </label>

        <input
          type='file'
          accept='image/*'
          onChange={onFileChange}
          className={fileInputClassName}
        />

        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:bg-accent ${dropzoneSpacing}`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <Image
              src={preview}
              alt={copy.form.image.previewAlt}
              width={300}
              height={200}
              className='mx-auto rounded'
            />
          ) : (
            <p className='text-muted-foreground text-sm'>
              {copy.form.image.helper}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

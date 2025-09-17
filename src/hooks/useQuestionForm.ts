"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CATEGORY_KEYS,
  CATEGORY_VALUES,
  type Category,
  type CategoryKey,
} from "@/types/category";

const fileSchema = z.array(z.instanceof(File)).max(1).optional();

const createQuestionFormSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    title: z.string().min(2, { message: t("form.content.errors.titleMin") }),
    category: z.enum(CATEGORY_VALUES as [Category, ...Category[]]),
    content: z
      .string()
      .min(1, { message: t("form.content.errors.contentRequired") }),
    file: fileSchema,
  });

export type QuestionFormValues = z.infer<
  ReturnType<typeof createQuestionFormSchema>
>;

export interface QuestionCategoryOption {
  key: CategoryKey;
  value: Category;
  label: string;
}

export interface QuestionFormCopy {
  subtitle: string;
  form: {
    title: {
      label: string;
      placeholder: string;
      max: string;
    };
    category: {
      label: string;
      placeholder: string;
    };
    content: {
      label: string;
      placeholder: string;
      max: string;
    };
    image: {
      label: string;
      helper: string;
      previewAlt: string;
    };
  };
  pointInfo: {
    title: string;
    description: string;
  };
  cancel: string;
  submit: {
    create: string;
    edit: string;
  };
}

export interface UseQuestionFormOptions {
  defaultValues?: UseFormProps<QuestionFormValues>["defaultValues"];
  mode?: UseFormProps<QuestionFormValues>["mode"];
  initialPreview?: string | null;
}

export interface UseQuestionFormResult {
  form: UseFormReturn<QuestionFormValues>;
  preview: string | null;
  resetPreview: () => void;
  getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
  getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  copy: QuestionFormCopy;
  categoryOptions: QuestionCategoryOption[];
  tToast: ReturnType<typeof useTranslations>;
}

export function useQuestionForm(
  options: UseQuestionFormOptions = {}
): UseQuestionFormResult {
  const { defaultValues, mode, initialPreview = null } = options;

  const t = useTranslations("question-form");
  const tToast = useTranslations("question-toast");

  const schema = useMemo(() => createQuestionFormSchema(t), [t]);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      ...defaultValues,
    },
    mode,
  });

  const [preview, setPreview] = useState<string | null>(initialPreview);

  const applyFiles = (files?: File[]) => {
    form.setValue("file", files, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (files && files[0]) {
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const resetPreview = () => {
    setPreview(initialPreview ?? null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      applyFiles(acceptedFiles);
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    applyFiles(Array.from(files));
  };

  const copy: QuestionFormCopy = useMemo(
    () => ({
      subtitle: t("subtitle"),
      form: {
        title: {
          label: t("form.title.label"),
          placeholder: t("form.title.placeholder"),
          max: t("form.title.max"),
        },
        category: {
          label: t("form.category.label"),
          placeholder: t("form.category.placeholder"),
        },
        content: {
          label: t("form.content.label"),
          placeholder: t("form.content.placeholder"),
          max: t("form.content.max"),
        },
        image: {
          label: t("form.image.label"),
          helper: t("form.image.helper"),
          previewAlt: t("form.image.previewAlt"),
        },
      },
      pointInfo: {
        title: t("pointInfo.title"),
        description: t("pointInfo.description"),
      },
      cancel: t("cancel"),
      submit: {
        create: t("submit.create"),
        edit: t("submit.edit"),
      },
    }),
    [t]
  );

  const categoryOptions = useMemo<QuestionCategoryOption[]>(
    () =>
      CATEGORY_KEYS.map((key, index) => ({
        key,
        value: (CATEGORY_VALUES as Category[])[index],
        label: t(`form.category.options.${key}`),
      })),
    [t]
  );

  return {
    form,
    preview,
    resetPreview,
    getRootProps,
    getInputProps,
    handleFileChange,
    copy,
    categoryOptions,
    tToast,
  };
}

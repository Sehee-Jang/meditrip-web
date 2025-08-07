import { z } from "zod";

export const questionFormSchema = z.object({
  title: z.string().min(2, { message: "제목은 2자 이상 입력해주세요." }),
  category: z.enum(["stress", "diet", "immunity", "women", "antiaging", "etc"]),
  content: z.string().min(1, { message: "질문 내용을 입력해주세요." }),
  file: z.preprocess(
    (val) => {
      if (!val || (Array.isArray(val) && val.length === 0)) return undefined;
      return val;
    },
    z
      .array(z.instanceof(File))
      .optional()
      .refine((files) => !files || files[0] instanceof File, {
        message: "유효한 이미지 파일을 선택해주세요.",
      })
  ),
});

export type QuestionFormData = z.infer<typeof questionFormSchema>;

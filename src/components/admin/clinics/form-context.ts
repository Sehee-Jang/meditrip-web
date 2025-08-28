import type { z } from "zod";
import type { clinicFormSchema } from "@/validations/clinic";

// 다른 파일에서 RHF 제네릭으로 사용할 폼 입력 타입
export type ClinicFormInput = z.input<typeof clinicFormSchema>;

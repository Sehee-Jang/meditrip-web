"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ClinicFormInput } from "../form-context";
import { toUndef } from "../form-utils";

export default function ContactsAndSocials() {
  const { register } = useFormContext<ClinicFormInput>();
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 px-5 py-4'>
      <Input
        {...register("phone", { setValueAs: toUndef })}
        placeholder='전화 (예: 02-123-4567, +82 10 1234 5678)'
      />
      <Input
        {...register("website", { setValueAs: toUndef })}
        placeholder='https://example.com'
      />
      <div />
      <Input
        {...register("socials.instagram", { setValueAs: toUndef })}
        placeholder='인스타 아이디 (예: onyu.health)'
      />
      <Input
        {...register("socials.line", { setValueAs: toUndef })}
        placeholder='LINE 아이디 (예: @onyu 또는 onyu)'
      />
      <Input
        {...register("socials.whatsapp", { setValueAs: toUndef })}
        placeholder='WhatsApp 아이디'
      />
    </div>
  );
}

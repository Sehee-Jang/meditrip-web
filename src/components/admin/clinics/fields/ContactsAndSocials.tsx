"use client";

import { useFormContext, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ClinicFormInput } from "../form-context";
import { toUndef } from "../form-utils";

type SocialsInput = NonNullable<ClinicFormInput["socials"]>;

export default function ContactsAndSocials() {
  const { register, formState } = useFormContext<ClinicFormInput>();
  const socialsErrors = formState.errors.socials as
    | FieldErrors<SocialsInput>
    | undefined;

  return (
    <div className='px-5 py-4 space-y-4'>
      {/* 전화 / 웹사이트 */}
      <div className='grid gap-3 md:grid-cols-2'>
        <div className='space-y-1.5'>
          <label className='text-xs text-muted-foreground'>전화</label>
          <Input
            {...register("phone", { setValueAs: toUndef })}
            placeholder='02-123-4567, +82 10 1234 5678'
            className='h-9'
          />
          <p className='text-xs text-destructive'>
            {formState.errors.phone?.message ?? ""}
          </p>
        </div>

        <div className='space-y-1.5'>
          <label className='text-xs text-muted-foreground'>웹사이트</label>
          <Input
            {...register("website", { setValueAs: toUndef })}
            placeholder='https://example.com'
            className='h-9'
          />
          <p className='text-xs text-destructive'>
            {formState.errors.website?.message ?? ""}
          </p>
        </div>
      </div>

      {/* SNS */}
      <div className='space-y-1.5'>
        <label className='text-xs text-muted-foreground'>SNS</label>
        <div className='grid gap-3 md:grid-cols-3'>
          <Input
            {...register("socials.instagram", { setValueAs: toUndef })}
            placeholder='인스타 아이디 (예: onyu.health)'
            className='h-9'
          />
          <Input
            {...register("socials.line", { setValueAs: toUndef })}
            placeholder='LINE 아이디 (예: @onyu 또는 onyu)'
            className='h-9'
          />
          <Input
            {...register("socials.whatsapp", { setValueAs: toUndef })}
            placeholder='WhatsApp 아이디'
            className='h-9'
          />
        </div>
        <div className='text-xs text-destructive'>
          {socialsErrors?.instagram?.message ?? ""}{" "}
          {socialsErrors?.line?.message ?? ""}{" "}
          {socialsErrors?.whatsapp?.message ?? ""}
        </div>
      </div>
    </div>
  );
}

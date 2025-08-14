"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CommonButton from "@/components/common/CommonButton";
import { CheckCircle2, Info, AlertCircle } from "lucide-react";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const domainParts = domain.split(".");
  const maskedName =
    name.length <= 2
      ? `${name[0]}*`
      : `${name[0]}${"*".repeat(Math.max(1, name.length - 2))}${name.at(-1)}`;
  const maskedDomain = `${domainParts[0][0]}***.${domainParts
    .slice(1)
    .join(".")}`;
  return `${maskedName}@${maskedDomain}`;
}

export default function ForgotPasswordForm() {
  const t = useTranslations("forgot-password");

  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setHintMsg(null);
    setErrMsg(null);
    setSending(true);

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes("password")) {
        await sendPasswordResetEmail(auth, email);
        setOkMsg(t("sent", { email: maskEmail(email) }));
      } else if (
        methods.includes("google.com") &&
        !methods.includes("password")
      ) {
        setHintMsg(t("googleOnlyHint"));
      } else {
        setErrMsg(t("notFound"));
      }
    } catch {
      setErrMsg(t("sendFailed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4' noValidate>
      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
          {t("emailLabel")}
        </Label>
        <Input
          id='email'
          type='email'
          value={email}
          autoComplete='email'
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={sending}
          placeholder={t("emailPlaceholder")}
          className='h-11'
        />
      </div>

      <CommonButton
        type='submit'
        className='w-full h-11 text-base'
        disabled={sending}
      >
        {sending ? t("loading") : t("submit")}
      </CommonButton>

      {/* 메시지 영역: 토스처럼 심플한 안내배너 */}
      <div className='space-y-2' aria-live='polite'>
        {okMsg && (
          <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800'>
            <CheckCircle2 className='mt-0.5 h-4 w-4 flex-none' />
            <p>{okMsg}</p>
          </div>
        )}
        {hintMsg && (
          <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800'>
            <Info className='mt-0.5 h-4 w-4 flex-none' />
            <p>{hintMsg}</p>
          </div>
        )}
        {errMsg && (
          <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-none' />
            <p>{errMsg}</p>
          </div>
        )}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CommonButton from "@/components/common/CommonButton";
import { CheckCircle2, Info, AlertCircle } from "lucide-react";
import { loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

export default function ForgotPasswordForm() {
  const t = useTranslations("forgot-password");

  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setInfoMsg(null);
    setErrMsg(null);
    setSending(true);

    const normalized = email.trim().toLowerCase();
    if (normalized !== email) setEmail(normalized);

    try {
      await sendPasswordResetEmail(auth, normalized);
      // 중립 문구 + Google 안내 함께 노출
      setOkMsg(t("requestReceived"));
      setInfoMsg(t("googleOnlyHint"));
    } catch {
      setErrMsg(t("sendFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // noop
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

      <div className='space-y-2' aria-live='polite'>
        {okMsg && (
          <div className='flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800'>
            <CheckCircle2 className='mt-0.5 h-4 w-4 flex-none' />
            <p>{okMsg}</p>
          </div>
        )}
        {infoMsg && (
          <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800'>
            <Info className='mt-0.5 h-4 w-4 flex-none' />
            <p>{infoMsg}</p>
          </div>
        )}
        {errMsg && (
          <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-none' />
            <p>{errMsg}</p>
          </div>
        )}
      </div>

      <CommonButton
        type='button'
        onClick={handleGoogle}
        variant='outline'
        className='w-full h-11 text-base flex items-center justify-center gap-2'
      >
        <FcGoogle className='h-5 w-5' />
        {t("ctaContinueWithGoogle")}
      </CommonButton>
    </form>
  );
}

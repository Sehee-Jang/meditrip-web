"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CommonButton from "@/components/common/CommonButton";
import { CheckCircle2, Info, AlertCircle } from "lucide-react";
import { loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FindPasswordForm() {
  const t = useTranslations("recovery");
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 재설정 버튼 핸들러
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

  // 구글 로그인 버튼 핸들러
  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // noop
    }
  };

  // 리셋 버튼 핸들러
  const resetEmailInput = () => {
    setEmail("");
    emailRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4' noValidate>
      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
          {t("common.emailLabel")}
        </Label>
        <Input
          id='email'
          ref={emailRef}
          type='email'
          value={email}
          autoComplete='email'
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={sending}
          placeholder={t("common.emailPlaceholder")}
          className='h-11'
        />
      </div>

      {/* 재설정 링크 보내기 버튼 */}
      <CommonButton
        type='submit'
        className='w-full h-11 text-base'
        disabled={sending}
      >
        {sending ? t("common.loading") : t("common.submit")}
      </CommonButton>

      {/* 상태 메시지 영역 */}
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

      {/* 구글로 계속 버튼 */}
      <CommonButton
        type='button'
        onClick={handleGoogle}
        variant='outline'
        className='w-full h-11 text-base flex items-center justify-center gap-2'
      >
        <FcGoogle className='h-5 w-5' />
        {t("common.ctaContinueWithGoogle")}
      </CommonButton>

      {/* 도움말 아코디언 */}
      <div className='pt-2'>
        <Accordion type='single' collapsible>
          <AccordionItem value='help'>
            <AccordionTrigger className='text-sm font-medium'>
              {t("help.title")}
            </AccordionTrigger>
            <AccordionContent className='text-sm text-muted-foreground space-y-3'>
              <div>• {t("help.spam")}</div>
              <div>• {t("help.address")}</div>
              <div className='flex flex-col gap-2'>
                <span>• {t("help.google")}</span>
                {/* 구글로 계속 버튼 */}
                <CommonButton
                  type='button'
                  variant='outline'
                  className='h-8 px-3'
                  onClick={handleGoogle}
                >
                  {t("common.ctaContinueWithGoogle")}
                </CommonButton>
              </div>

              <div className='flex items-center gap-2'>
                <span>• {t("help.changeEmail")}</span>
                <button
                  type='button'
                  onClick={resetEmailInput}
                  className='underline text-blue-600 hover:opacity-80'
                  aria-label={t("help.changeEmailActionAria")}
                >
                  {t("help.changeEmailAction")}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </form>
  );
}

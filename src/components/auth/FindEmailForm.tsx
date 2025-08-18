"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CommonButton from "@/components/common/CommonButton";
import { CheckCircle2, Info, AlertCircle, Mail } from "lucide-react";
import { loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const d = domain.split(".");
  const maskedName =
    name.length <= 2
      ? `${name[0]}*`
      : `${name[0]}${"*".repeat(Math.max(1, name.length - 2))}${name.at(-1)}`;
  const maskedDomain = `${d[0][0]}***.${d.slice(1).join(".")}`;
  return `${maskedName}@${maskedDomain}`;
}

export default function FindEmailForm() {
  const t = useTranslations("recovery");

  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 이 브라우저의 최근 로그인 힌트(마스킹)
  const [lastMasked, setLastMasked] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mt_last_email");
      if (raw) setLastMasked(maskEmail(raw));
    } catch {
      // no-op
    }
  }, []);

  // 버튼 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setInfoMsg(null);
    setErrMsg(null);
    setSending(true);

    const normalized = email.trim().toLowerCase();
    if (normalized !== email) setEmail(normalized);

    try {
      // 중립 처리: 존재 여부에 관계없이 시도
      await sendPasswordResetEmail(auth, normalized);
      setOkMsg(t("common.requestReceived")); // “요청을 접수했어요…”
      setInfoMsg(t("common.googleOnlyHint")); // Google 계정 안내
    } catch {
      setErrMsg(t("common.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  // 구글 로그인 버튼 핸들러
  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch {
      /* no-op */
    }
  };

  const useLast = () => {
    if (!lastMasked) return;
    try {
      const raw = localStorage.getItem("mt_last_email");
      if (raw) setEmail(raw);
      emailRef.current?.focus();
    } catch {
      /* no-op */
    }
  };

  // 이메일 입력 초기화 버튼 핸들러
  const resetEmailInput = () => {
    setEmail("");
    emailRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5' noValidate>
      {/* 이 브라우저의 최근 로그인 힌트 */}
      <div className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-3'>
        <div className='flex items-start gap-2 text-sm text-gray-700'>
          <Mail className='h-4 w-4 mt-0.5 flex-none' />
          <div>
            <p className='font-medium'>{t("findEmail.deviceHint.title")}</p>
            <p className='mt-0.5'>
              {lastMasked
                ? t("findEmail.deviceHint.found", { email: lastMasked })
                : t("findEmail.deviceHint.empty")}
            </p>
            {lastMasked && (
              <button
                type='button'
                onClick={useLast}
                className='mt-2 underline text-blue-600 hover:opacity-80'
              >
                {t("findEmail.deviceHint.use")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 이메일 입력 */}
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

      <CommonButton
        type='submit'
        className='w-full h-11 text-base'
        disabled={sending}
      >
        {sending ? t("common.loading") : t("common.submit")}
      </CommonButton>

      {/* 상태 메시지 */}
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

      {/* Google CTA */}
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
            <AccordionContent className='text-sm text-gray-600 space-y-3'>
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

"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { registerWithEmail } from "@/lib/auth";
import CommonButton from "../CommonButton";
import Container from "../Container";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Link } from "@/i18n/navigation";

export default function SignupSection() {
  const t = useTranslations("signup-section");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState("");

  // 1. Auth 상태 관리
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 2. 이미 로그인(회원가입) 완료된 상태면 아무것도 렌더하지 않음
  if (user && !user.isAnonymous) {
    return null;
  }

  const validate = () => {
    if (!email.includes("@")) return "이메일 형식이 올바르지 않습니다.";
    if (pw.length < 8 || !/\d/.test(pw) || !/[a-zA-Z]/.test(pw))
      return "비밀번호는 8자 이상, 영문/숫자를 포함해야 합니다.";
    if (pw !== pwCheck) return "비밀번호가 일치하지 않습니다.";
    if (!agreeTerms) return "이용약관에 동의해야 가입할 수 있습니다.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationMsg = validate();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    try {
      await registerWithEmail({
        email,
        password: pw,
        nickname,
        agreeTerms,
        agreeMarketing,
      });
      toast.success(t("successToast"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원가입에 실패했습니다.");
      }
    }
  };

  return (
    <section id='signup-section' className='w-full bg-white py-[60px]'>
      <Container className='text-center'>
        <div className='w-full max-w-[1440px] px-[20px] md:px-[170px] text-center'>
          <h2 className='text-2xl md:text-4xl font-bold mb-4'>{t("title")}</h2>
          <p className='text-muted-foreground mb-10'>{t("description")}</p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col items-center gap-5 w-full max-w-[360px] md:max-w-[1100px] mx-auto'
          >
            {/* 개인정보 입력란 */}
            <div className='flex flex-col md:flex-row gap-5 w-full justify-center'>
              <input
                type='email'
                placeholder={t("emailPlaceholder")}
                className='max-w-[360px] w-full border px-4 py-2 rounded'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type='password'
                placeholder={t("passwordPlaceholder")}
                className='max-w-[360px] w-full border px-4 py-2 rounded'
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <input
                type='password'
                placeholder={t("passwordConfirmPlaceholder")}
                className='max-w-[360px] w-full border px-4 py-2 rounded'
                value={pwCheck}
                onChange={(e) => setPwCheck(e.target.value)}
              />
              <input
                type='text'
                placeholder={t("nicknamePlaceholder")}
                className='max-w-[360px] w-full border px-4 py-2 rounded'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {/* 개인정보 및 마케팅 활용 동의*/}
            <div className='text-left text-sm space-y-2'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                {t("agreeTermsLabel")}
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={agreeMarketing}
                  onChange={() => setAgreeMarketing(!agreeMarketing)}
                />
                {t("agreeMarketingLabel")}
              </label>
            </div>

            {/* 회원가입 버튼 */}
            <CommonButton type='submit'>{t("button")}</CommonButton>

            {/* 로그인 CTA */}
            <p className='mt-4 text-sm'>
              {t("alreadyRegistered.title")}{" "}
              <Link
                href='/login'
                className='font-medium text-blue-600 hover:underline'
              >
                {t("alreadyRegistered.login")}
              </Link>
            </p>

            {error && <p className='text-red-500 mt-2'>{error}</p>}
          </form>
        </div>
      </Container>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { registerWithEmail } from "@/lib/auth";
import CommonButton from "./CommonButton";
import Container from "./layout/Container";

export default function SignupSection() {
  const t = useTranslations("SignupSection");

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      const user = await registerWithEmail({ email, password: pw, nickname });
      console.log("회원가입 성공:", user);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원가입에 실패했습니다.");
      }
    }
  };

  if (success) {
    return <div>🎉 회원가입이 완료되었습니다!</div>;
  }
  return (
    <section className='w-full bg-white py-[60px]'>
      <Container className='text-center'>
        <div className='w-full max-w-[1440px] px-[20px] md:px-[170px] text-center'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>{t("title")}</h2>
          <p className='text-muted-foreground mb-10'>{t("description")}</p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col items-center gap-5 w-full max-w-[360px] md:max-w-[1100px] mx-auto'
          >
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

            <CommonButton>{t("button")}</CommonButton>

            {error && <p className='text-red-500 mt-2'>{error}</p>}
          </form>
        </div>
      </Container>
    </section>
  );
}

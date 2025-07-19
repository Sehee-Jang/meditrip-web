"use client";

import { useState } from "react";
import { registerWithEmail } from "@/lib/auth";

export default function SignupPage() {
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
    <form onSubmit={handleSubmit}>
      <h1>회원가입</h1>

      <input
        type='email'
        placeholder='이메일'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        type='password'
        placeholder='비밀번호'
        value={pw}
        onChange={(e) => setPw(e.target.value)}
      />
      <br />

      <input
        type='password'
        placeholder='비밀번호 확인'
        value={pwCheck}
        onChange={(e) => setPwCheck(e.target.value)}
      />
      <br />

      <input
        type='text'
        placeholder='닉네임'
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <br />

      <label>
        <input
          type='checkbox'
          checked={agreeTerms}
          onChange={() => setAgreeTerms(!agreeTerms)}
        />
        이용약관 동의 (필수)
      </label>
      <br />

      <label>
        <input
          type='checkbox'
          checked={agreeMarketing}
          onChange={() => setAgreeMarketing(!agreeMarketing)}
        />
        마케팅 수신 동의 (선택)
      </label>
      <br />

      <button type='submit'>가입하기</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

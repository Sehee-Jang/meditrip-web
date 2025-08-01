"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("login-page");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // 일반 로그인
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingEmail(true);
    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setLoadingEmail(false);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='w-full max-w-md bg-white p-8 rounded-xl shadow-lg'>
        <h1 className='text-3xl font-bold mb-6 text-center'>{t("title")}</h1>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block mb-1 text-sm font-medium'>
              {t("email")}
            </label>
            <input
              type='email'
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className='block mb-1 text-sm font-medium'>
              {t("password")}
            </label>
            <input
              type='password'
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className='text-red-500 text-sm'>{error}</p>}

          <button
            type='submit'
            disabled={loadingEmail}
            className='w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50'
          >
            {loadingEmail ? t("loading") : t("login")}
          </button>
        </form>

        {/* OR Divider */}
        <div className='flex items-center my-4'>
          <span className='flex-grow h-px bg-gray-200'></span>
          <span className='px-2 text-gray-400 text-sm'>{t("or")}</span>
          <span className='flex-grow h-px bg-gray-200'></span>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-2 hover:bg-gray-100 transition disabled:opacity-50 mb-4'
        >
          <FcGoogle className='w-6 h-6' />
          {loadingGoogle ? t("loading") : t("googleLogin")}
        </button>

        {/* Links */}
        <div className='mt-6 flex justify-between text-sm'>
          <Link
            href='/forgot-password'
            className='text-blue-600 hover:underline'
          >
            {t("forgotPassword")}
          </Link>
          <Link href='/signup' className='text-blue-600 hover:underline'>
            {t("noAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}

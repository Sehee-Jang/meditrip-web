"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginWithEmail } from "@/lib/auth";

export default function LoginPage() {
  const t = useTranslations("login-page");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push("/"); // 로그인 성공 후 리다이렉트 경로
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='w-full max-w-sm bg-white p-6 rounded-lg shadow'>
        <h1 className='text-2xl font-semibold mb-6 text-center'>
          {t("title")}
        </h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block mb-1 text-sm'>{t("email")}</label>
            <input
              type='email'
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='block mb-1 text-sm'>{t("password")}</label>
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
            disabled={loading}
            className='w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
          >
            {loading ? t("loading") : t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("forgot-password");

  return (
    <main className='px-4 py-10 md:py-16'>
      <div className='mx-auto w-full max-w-lg'>
        <section className='rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm'>
          <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-gray-900'>
            {t("title")}
          </h1>
          <p className='mt-2 text-sm text-gray-500'>{t("desc")}</p>

          <div className='mt-6'>
            <ForgotPasswordForm />
          </div>
        </section>

        {/* 하단 보조 링크 */}
        <p className='mt-4 text-center text-sm text-gray-500'>
          {/* 필요 시 다른 링크 추가 가능 */}
        </p>
      </div>
    </main>
  );
}

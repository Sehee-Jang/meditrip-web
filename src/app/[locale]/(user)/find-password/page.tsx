import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "@/components/auth/FindPasswordForm";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("recovery");

  return (
    <main className='px-4 py-10 md:py-16'>
      <div className='mx-auto w-full max-w-lg'>
        <section className='rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm'>
          <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-gray-900'>
            {t("forgotPassword.title")}
          </h1>
          <p className='mt-2 text-sm text-gray-500'>
            {t("forgotPassword.desc")}
          </p>

          <div className='mt-6'>
            <ForgotPasswordForm />
          </div>
        </section>

        {/*  하단 보조 링크 */}
        {/* <div className='mt-6 flex justify-between text-sm'>
          <Link href='/find-email' className='text-blue-600 hover:underline'>
            {t("common.forgotEmailLink")}
          </Link>
          <Link href='/login' className='text-blue-600 hover:underline'>
            {t("common.loginLink")}
          </Link>
        </div> */}
      </div>
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "@/components/auth/FindPasswordForm";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("recovery");

  return (
    <main className='px-4 py-10 md:py-16'>
      <div className='mx-auto w-full max-w-lg'>
        <section className='rounded-2xl border border-border bg-background p-6 md:p-8 shadow-sm'>
          <h1 className='text-2xl md:text-3xl font-semibold tracking-tight text-foreground'>
            {t("forgotPassword.title")}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t("forgotPassword.desc")}
          </p>

          <div className='mt-6'>
            <ForgotPasswordForm />
          </div>
        </section>
      </div>
    </main>
  );
}

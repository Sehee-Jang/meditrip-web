import { ReactNode } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import AuthObserver from "@/components/AuthObserver";
import "../globals.css";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export const metadata = {
  title: "Meditrip",
  description: "일본 타겟 사전 유입용 웹사이트",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale}>
      <body>
        <AuthObserver />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

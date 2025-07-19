import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import AuthObserver from "@/components/AuthObserver";
import "../globals.css";

export const metadata = {
  title: "Meditrip",
  description: "일본 타겟 사전 유입용 웹사이트",
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Header />
          <AuthObserver />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

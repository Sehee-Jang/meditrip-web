import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import AuthObserver from "@/components/AuthObserver";
import { Toaster } from "@/components/ui/sonner";
import { getMessages } from "next-intl/server";

export const metadata = {
  title: "Meditrip",
  description: "메디트립",
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

  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
      <AuthObserver />
      {children}
      <Toaster />
      <Footer />
    </NextIntlClientProvider>
  );
}

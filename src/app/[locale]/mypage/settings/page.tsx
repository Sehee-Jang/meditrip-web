"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/layout/PageHeader";
import CommonButton from "@/components/layout/CommonButton";
import Container from "@/components/layout/Container";
import { Switch } from "@/components/ui/switch";
import { Lock, Trash2, Bell, Globe, HelpCircle } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const [nickname, setNickname] = useState("");
  const [marketing, setMarketing] = useState(true);

  return (
    <main className='max-w-3xl mx-auto md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <Container>
        {/* 계정 관리 */}
        <section className='mb-8'>
          <h2 className='font-bold text-lg mb-4'>{t("account.title")}</h2>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Lock className='w-6 h-6 text-gray-600' />
              <div>
                <p className='font-medium'>{t("account.password")}</p>
                <p className='text-sm text-gray-500'>
                  {t("account.passwordDesc")}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <Trash2 className='w-6 h-6 text-gray-600' />
              <div>
                <p className='font-medium'>{t("account.delete")}</p>
                <p className='text-sm text-gray-500'>
                  {t("account.deleteDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 닉네임 수정 */}
        <section className='mb-8'>
          <h2 className='font-bold text-lg mb-2'>{t("nickname.title")}</h2>
          <input
            type='text'
            placeholder={t("nickname.placeholder")}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className='w-full border rounded px-4 py-2 mb-2'
          />
          <p className='text-sm text-gray-500'>{t("nickname.note")}</p>
        </section>

        {/* 앱 설정 */}
        <section className='mb-8'>
          <h2 className='font-bold text-lg mb-4'>{t("app.title")}</h2>
          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <Bell className='w-5 h-5 text-gray-600' />
              <p>{t("app.marketing")}</p>
            </div>

            <Switch checked={marketing} onCheckedChange={setMarketing} className=""/>
          </div>

          <div className='flex items-center justify-between py-2'>
            <div className='flex items-center gap-2'>
              <Globe className='w-5 h-5 text-gray-600' />
              <p>{t("app.language")}</p>
            </div>
            <p className='text-sm text-gray-500'>{t("app.currentLanguage")}</p>
          </div>
        </section>

        {/* 고객 지원 */}
        <section className='mb-8'>
          <h2 className='font-bold text-lg mb-4'>{t("support.title")}</h2>
          <div className='flex items-center gap-2'>
            <HelpCircle className='w-5 h-5 text-gray-600' />
            <p>{t("support.contact")}</p>
          </div>
        </section>

        {/* 하단 버튼 (모바일/데스크탑 공통) */}
        <div className='flex justify-between gap-2 mt-8'>
          <CommonButton className='w-1/2 bg-white text-black border'>
            {t("buttons.cancel")}
          </CommonButton>
          <CommonButton className='w-1/2'>{t("buttons.save")}</CommonButton>
        </div>
      </Container>
    </main>
  );
}

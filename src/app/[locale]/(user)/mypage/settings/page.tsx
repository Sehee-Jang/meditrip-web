import PageHeader from "@/components/common/PageHeader";
import Container from "@/components/common/Container";
import SettingsClient from "@/components/mypage/settings/SettingsClient";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("settings-page");

  return (
    <main className='max-w-3xl mx-auto md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <Container>
        <SettingsClient />
      </Container>
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/common/PageHeader";
import Container from "@/components/common/Container";

type PageParams = Promise<{
  locale: string;
}>;

export default async function PrivacyPage({ params }: { params: PageParams }) {
  const t = await getTranslations("privacy-page");
  const { locale } = await params;

  // 본문 배열은 messages/ko/privacy-page.json 에서 직접 로드
  const data = (
    await import(`../../../../../messages/${locale}/privacy-page.json`)
  ).default as typeof import("../../../../../messages/ko/privacy-page.json");

  return (
    <main className='max-w-4xl mx-auto md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon={true}
        center={true}
      />

      <Container>
        <article className='prose lg:prose-lg'>
          {/* 개인정보 처리방침 전문 */}
          <h1>{data.h1}</h1>
          <h2 className='text-sm text-muted-foreground'>{data.h2}</h2>
          <p>{data.description}</p>

          {/* 섹션1 */}
          <section>
            <h3 className='font-semibold'>{data.section1_title}</h3>
            <p className='mt-2 font-medium'>{data.section1_required_label}</p>
            <ul className='list-disc list-inside ml-4 space-y-1'>
              {data.section1_required.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className='mt-2 font-medium'>{data.section1_optional_label}</p>
            <ul className='list-disc list-inside ml-4 space-y-1'>
              {data.section1_optional.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className='mt-2 font-medium'>{data.section1_under14_label}</p>
            <ul className='list-disc list-inside ml-4 space-y-1'>
              {data.section1_under14.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 섹션2 ～ 섹션8 */}
          {([2, 3, 4, 5, 6, 7, 8] as const).map((n) => {
            const titleKey = `section${n}_title` as keyof typeof data;
            const bodyKey = `section${n}` as keyof typeof data;
            const sectionTitle = data[titleKey] as string;
            const lines = data[bodyKey] as string[];

            return (
              <section key={n}>
                <h3 className='font-semibold'>{sectionTitle}</h3>
                <ul className='list-disc list-inside ml-4 space-y-1'>
                  {lines.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                {/* 8번 섹션 끝에 동의 안내 추가 */}
                {n === 8 && <p className='mt-4'>{data.section8_consent}</p>}
              </section>
            );
          })}
        </article>
      </Container>
    </main>
  );
}

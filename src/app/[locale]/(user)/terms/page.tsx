import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/common/PageHeader";
import Container from "@/components/common/Container";

type PageParams = Promise<{ locale: string }>;

export default async function TermsPage({ params }: { params: PageParams }) {
  const { locale } = await params;
  const t = await getTranslations("terms-page");

  // locale별 JSON 파일을 동적으로 import
  const data = (
    await import(`../../../../../messages/${locale}/terms-page.json`)
  ).default as typeof import("../../../../../messages/ko/terms-page.json");

  return (
    <main className='max-w-4xl mx-auto md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon={true}
        center={true}
      />

      <Container>
        <article className='prose lg:prose-lg space-y-6'>
          {/* 페이지 타이틀 */}
          <h1>{data.h1}</h1>
          <h2 className='text-sm text-gray-500'>{data.h2}</h2>

          {/* 조문별 반복 렌더링 */}
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((n) => {
            const titleKey = `section${n}_title` as keyof typeof data;
            const bodyKey = `section${n}` as keyof typeof data;
            const sectionTitle = data[titleKey] as string;
            const lines = data[bodyKey] as string[];

            return (
              <section key={n}>
                <h3 className='font-semibold'>{sectionTitle}</h3>
                <ul className='list-disc list-inside ml-4 space-y-1'>
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </article>
      </Container>
    </main>
  );
}

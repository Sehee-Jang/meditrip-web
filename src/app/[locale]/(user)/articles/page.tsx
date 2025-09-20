import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import Container from "@/components/common/Container";
import ArticlesListClient from "@/components/articles/ArticlesListClient";
import PageHeader from "@/components/common/PageHeader";
import type { LocaleKey } from "@/constants/locales";
import { buildCanonicalURL, buildHreflangMap, toOgLocale } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { getArticleForSeo } from "@/services/articles/getArticleForSeo";

type SearchParams = {
  categories?: string | string[];
  q?: string;
  id?: string | string[]; // 상세 인라인 뷰 id
};

/* -------------------- SEO: 메타데이터 -------------------- */
type Params = Promise<{ locale: LocaleKey }>;
type SP = Promise<SearchParams>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const rawId = sp?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // 목록 페이지 메타
  if (!id) {
    const canonical = buildCanonicalURL(locale, "/articles");
    const title = "아티클";
    const description = "웰니스/클리닉 관련 가이드와 특집을 확인하세요.";

    return {
      title,
      description,
      alternates: { canonical },
      robots:
        process.env.VERCEL_ENV === "production"
          ? {
              index: true,
              follow: true,
              "max-snippet": -1,
              "max-image-preview": "large",
              "max-video-preview": -1,
            }
          : { index: false, follow: true },
      openGraph: {
        type: "website",
        siteName: SITE.name,
        locale: toOgLocale(locale),
        url: canonical,
        title,
        description,
        images: [
          {
            url: absoluteUrl(SITE.og.defaultImage),
            width: SITE.og.width,
            height: SITE.og.height,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [absoluteUrl(SITE.og.defaultImage)],
        site: SITE.twitterSite,
      },
    };
  }
  // 상세(인라인) 메타: ?id= 자신을 canonical로
  const canonical = buildCanonicalURL(locale, "/articles", { id });
  const hreflang = buildHreflangMap({ path: "/articles", query: { id } });

  const seo = await getArticleForSeo(id, locale);
  if (!seo) {
    return {
      title: "문서를 찾을 수 없음",
      description: "요청한 아티클이 존재하지 않습니다.",
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.tags, // 관리자 입력 태그 → <meta name="keywords">
    alternates: { canonical, languages: hreflang },
    robots: seo.hidden
      ? { index: false, follow: true }
      : process.env.VERCEL_ENV === "production"
      ? {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        }
      : { index: false, follow: true },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      locale: toOgLocale(locale),
      url: canonical,
      title: seo.title,
      description: seo.description,
      images: [
        { url: seo.imageUrl, width: SITE.og.width, height: SITE.og.height },
      ],
      publishedTime: seo.published,
      modifiedTime: seo.modified,
      // section/tags는 JSON-LD에서 확실히 표기
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.imageUrl],
      site: SITE.twitterSite,
    },
  };
}

/* -------------------- 페이지 본문 -------------------- */
function isCategoryKey(v: unknown): v is CategoryKey {
  return (
    typeof v === "string" && (CATEGORY_KEYS as readonly string[]).includes(v)
  );
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: LocaleKey }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const t = await getTranslations("article");
  const sp = await searchParams;

  const raw = sp?.categories;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const flat = arr
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  const initialSelectedCategories: CategoryKey[] = Array.from(
    new Set(flat.filter(isCategoryKey))
  );
  const initialKeyword = typeof sp?.q === "string" ? sp.q : "";

  // 상세 JSON-LD: id 있을 때만 삽입
  const rawId = sp?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  let jsonLd: string | null = null;
  if (id) {
    const seo = await getArticleForSeo(id, locale);
    if (seo) {
      const canonical = buildCanonicalURL(locale, "/articles", { id });
      const aboutThings = seo.tags
        .slice(0, 3)
        .map((t) => ({ "@type": "Thing", name: t }));
      jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        headline: seo.title,
        description: seo.description,
        image: seo.imageUrl,
        datePublished: seo.published,
        dateModified: seo.modified,
        author: { "@type": "Organization", name: SITE.name },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logoPath) },
        },
        inLanguage: locale,
        articleSection: [seo.section],
        keywords: seo.tags.join(", "),
        about: aboutThings,
      } as const);
    }
  }

  return (
    <main className='md:px-4 md:py-8'>
      {/* 상세일 때만 JSON-LD 삽입 */}
      {jsonLd ? (
        <script
          type='application/ld+json'
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}

      <PageHeader
        desktopTitle={t("common.title")}
        mobileTitle={t("common.title")}
        desc={t("common.desc")}
        showBackIcon
        center
      />

      {/* 리스트(행 형태) */}
      <Container className='mb-10'>
        <ArticlesListClient
          initialSelectedCategories={initialSelectedCategories}
          initialKeyword={initialKeyword}
        />
      </Container>
    </main>
  );
}

import type { LocaleKey } from "@/constants/locales";
import { getArticleById } from "@/services/articles/getArticleById";
import { SITE, toAbsoluteImageUrl } from "@/lib/site";
import { ArticleSeo } from "@/types/articles";

export async function getArticleForSeo(
  id: string,
  locale: LocaleKey
): Promise<ArticleSeo | null> {
  const a = await getArticleById(id);
  if (!a) return null;

  const title =
    a.title?.[locale] ?? a.title?.ko ?? a.title?.ja ?? a.title?.en ?? "";
  const description =
    a.excerpt?.[locale] ??
    a.excerpt?.ko ??
    a.excerpt?.ja ??
    a.excerpt?.en ??
    "";
  const imageRaw = a.images?.[0] ?? SITE.og.defaultImage;

  return {
    title,
    description,
    imageUrl: toAbsoluteImageUrl(imageRaw),
    tags: Array.isArray(a.tags) ? a.tags.filter(Boolean) : [],
    section: a.category,
    published: a.createdAt || new Date().toISOString(),
    modified: a.updatedAt || a.createdAt || new Date().toISOString(),
    hidden: a.status === "hidden",
  };
}

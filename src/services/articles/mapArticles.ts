import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import type {
  CreateArticleInput,
  UpdateArticleInput,
  Article,
  ArticleDoc,
} from "@/types/articles";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import { toISO } from "@/utils/date";
import { LocaleKey, LOCALES_TUPLE } from "@/constants/locales";
import { LocalizedTextDoc, LocalizedRichTextDoc } from "@/types/common";
import type { JSONContent } from "@tiptap/core";

/** 기본 빈 문서 */
const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/** 문자열을 Tiptap JSON 문서로 변환 */
function toTiptapDoc(text: string): JSONContent {
  const trimmed = text.trim();
  return trimmed.length > 0
    ? {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: trimmed }],
          },
        ],
      }
    : EMPTY_DOC;
}

/** 값이 Tiptap JSON 형태인지 판별 */
function isJSONContent(v: unknown): v is JSONContent {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return obj.type === "doc";
}

/** 카테고리 정규화 */
function normalizeCategory(v: unknown): CategoryKey {
  const s = String(v ?? "");
  return (CATEGORY_KEYS as readonly string[]).includes(s)
    ? (s as CategoryKey)
    : "stress";
}

/** 문자열/부분 객체 → 완전한 다국어 객체로 정규화 */
function normalizeI18n(v: unknown): LocalizedTextDoc {
  if (typeof v === "string") {
    // 문자열만 온 경우 ko에 채우고 나머지는 빈 문자열
    const out: Partial<Record<LocaleKey, string>> = {};
    for (const loc of LOCALES_TUPLE) out[loc] = loc === "ko" ? v : "";
    return out as LocalizedTextDoc;
  }
  const obj = (v && typeof v === "object" ? v : {}) as Partial<
    Record<LocaleKey, unknown>
  >;
  const out: Partial<Record<LocaleKey, string>> = {};
  for (const loc of LOCALES_TUPLE) {
    const val = obj[loc];
    out[loc] = typeof val === "string" ? val : "";
  }
  return out as LocalizedTextDoc;
}

/** 문자열/부분 객체 → 완전한 다국어 리치텍스트(JSONContent) 객체로 정규화 */
function normalizeRichI18n(v: unknown): LocalizedRichTextDoc {
  // 과거 데이터가 통째로 문자열이면 ko에만 채우기
  if (typeof v === "string") {
    const out: Partial<Record<LocaleKey, JSONContent>> = {};
    for (const loc of LOCALES_TUPLE) out[loc] = loc === "ko" ? toTiptapDoc(v) : EMPTY_DOC;
    return out as LocalizedRichTextDoc;
  }

  const obj = (v && typeof v === "object" ? v : {}) as Partial<
    Record<LocaleKey, unknown>
  >;

  const out: Partial<Record<LocaleKey, JSONContent>> = {};
  for (const loc of LOCALES_TUPLE) {
    const val = obj[loc];
    if (typeof val === "string") {
      out[loc] = toTiptapDoc(val);
    } else if (isJSONContent(val)) {
      out[loc] = val;
    } else {
      out[loc] = EMPTY_DOC;
    }
  }
  return out as LocalizedRichTextDoc;
}

/** images 정규화: string|string[]|null|undefined → string[] */
function normalizeImages(v: unknown): string[] {
  if (Array.isArray(v)) {
    return (v.filter((x) => typeof x === "string" && x) as string[]) ?? [];
  }
  if (typeof v === "string") {
    return v ? [v] : [];
  }
  return [];
}

/** Firestore → 앱 표준(ko 문자열 뽑아서, ISO/기본값 보장) */
export function mapSnapToArticle(
  snap: QueryDocumentSnapshot<DocumentData>
): Article {
  const raw = snap.data() as ArticleDoc;
  const rawAny = raw as unknown as { images?: unknown };

  const createdAtISO = toISO(raw.createdAt);
  const updatedAtISO = toISO(raw.updatedAt);

  return {
    id: snap.id,
    title: normalizeI18n(raw.title),
    excerpt: normalizeI18n(raw.excerpt),
    body: normalizeRichI18n(raw.body),
    category: normalizeCategory(raw.category),
    tags: Array.isArray(raw.tags) ? (raw.tags.filter(Boolean) as string[]) : [],
    images: normalizeImages(rawAny.images),

    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
    likeCount: typeof raw.likeCount === "number" ? raw.likeCount : 0,
    isHidden: Boolean(raw.isHidden ?? false),

    createdAt: createdAtISO || new Date().toISOString(),
    updatedAt: updatedAtISO || createdAtISO || new Date().toISOString(),
  };
}

/** (옵션) 원본 객체 → 앱 표준 수동 변환이 필요할 때 */
export function mapDocToArticle(id: string, raw: ArticleDoc): Article {
  const rawAny = raw as unknown as {
    images?: unknown;
    thumbnailUrl?: unknown;
  };
  const createdAtISO = toISO(raw.createdAt);
  const updatedAtISO = toISO(raw.updatedAt);

  return {
    id,
    title: normalizeI18n(raw.title),
    excerpt: normalizeI18n(raw.excerpt),
    body: normalizeRichI18n(raw.body),
    category: normalizeCategory(raw.category),
    tags: Array.isArray(raw.tags) ? (raw.tags.filter(Boolean) as string[]) : [],
    images: normalizeImages(rawAny.images),

    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
    likeCount: typeof raw.likeCount === "number" ? raw.likeCount : 0,
    isHidden: Boolean(raw.isHidden ?? false),

    createdAt: createdAtISO || new Date().toISOString(),
    updatedAt: updatedAtISO || createdAtISO || new Date().toISOString(),
  };
}

/** 생성 입력 → Firestore 문서 형태(다국어 객체로 저장) */
export function mapCreateInputToDoc(input: CreateArticleInput): ArticleDoc {
  return {
    title: normalizeI18n(input.title),
    excerpt: normalizeI18n(input.excerpt),
    body: normalizeRichI18n(input.body),
    category: input.category,
    tags: Array.isArray(input.tags)
      ? (input.tags.filter(Boolean) as string[])
      : [],
    images: normalizeImages(input.images),
    isHidden: Boolean(input.isHidden ?? false),

    viewCount: 0,
    likeCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/** 수정 입력(부분) → Firestore 업데이트 payload(다국어 객체 유지) */
export function mapUpdateInputToDoc(
  patch: UpdateArticleInput
): Partial<ArticleDoc> {
  const data: Partial<ArticleDoc> = { updatedAt: serverTimestamp() };

  if (typeof patch.title !== "undefined")
    data.title = normalizeI18n(patch.title);
  if (typeof patch.excerpt !== "undefined")
    data.excerpt = normalizeI18n(patch.excerpt);
  if (typeof patch.body !== "undefined") data.body = normalizeRichI18n(patch.body);
  if (typeof patch.category === "string") data.category = patch.category;
  if (Array.isArray(patch.tags)) data.tags = patch.tags;
  if (Array.isArray(patch.images)) data.images = normalizeImages(patch.images);
  if (typeof patch.isHidden === "boolean") data.isHidden = patch.isHidden;

  return data;
}

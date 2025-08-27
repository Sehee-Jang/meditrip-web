import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import type {
  CreateWellnessInput,
  LocalizedTextDoc,
  UpdateWellnessInput,
  Wellness,
  WellnessDoc,
} from "@/types/wellness";
import { CATEGORY_KEYS, type CategoryKey } from "@/constants/categories";
import { toISO } from "@/utils/date";
import { LocaleKey, LOCALES_TUPLE } from "@/constants/locales";

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

/** 다국어 문서에서 ko 문자열만 뽑아 UI 모델에 넣기 */
function pickKo(v: LocalizedTextDoc | string | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.ko ?? "";
}

/** Firestore → 앱 표준(ko 문자열 뽑아서, ISO/기본값 보장) */
export function mapSnapToWellness(
  snap: QueryDocumentSnapshot<DocumentData>
): Wellness {
  const raw = snap.data() as WellnessDoc;

  const createdAtISO = toISO(raw.createdAt);
  const updatedAtISO = toISO(raw.updatedAt);

  return {
    id: snap.id,
    title: pickKo(raw.title),
    excerpt: pickKo(raw.excerpt),
    body: pickKo(raw.body),
    category: normalizeCategory(raw.category),
    tags: Array.isArray(raw.tags) ? (raw.tags.filter(Boolean) as string[]) : [],
    thumbnailUrl: typeof raw.thumbnailUrl === "string" ? raw.thumbnailUrl : "",

    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
    likeCount: typeof raw.likeCount === "number" ? raw.likeCount : 0,
    isHidden: Boolean(raw.isHidden ?? false),

    createdAt: createdAtISO || new Date().toISOString(),
    updatedAt: updatedAtISO || createdAtISO || new Date().toISOString(),
  };
}

/** (옵션) 원본 객체 → 앱 표준 수동 변환이 필요할 때 */
export function mapDocToWellness(id: string, raw: WellnessDoc): Wellness {
  const createdAtISO = toISO(raw.createdAt);
  const updatedAtISO = toISO(raw.updatedAt);

  return {
    id,
    title: String(raw.title ?? ""),
    excerpt: String(raw.excerpt ?? ""),
    body: String(raw.body ?? ""),
    category: normalizeCategory(raw.category),
    tags: Array.isArray(raw.tags) ? (raw.tags.filter(Boolean) as string[]) : [],
    thumbnailUrl: typeof raw.thumbnailUrl === "string" ? raw.thumbnailUrl : "",

    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
    likeCount: typeof raw.likeCount === "number" ? raw.likeCount : 0,
    isHidden: Boolean(raw.isHidden ?? false),

    createdAt: createdAtISO || new Date().toISOString(),
    updatedAt: updatedAtISO || createdAtISO || new Date().toISOString(),
  };
}

/** 생성 입력 → Firestore 문서 형태(다국어 객체로 저장) */
export function mapCreateInputToDoc(input: CreateWellnessInput): WellnessDoc {
  return {
    title: normalizeI18n(input.title),
    excerpt: normalizeI18n(input.excerpt),
    body: normalizeI18n(input.body),
    category: input.category,
    tags: Array.isArray(input.tags)
      ? (input.tags.filter(Boolean) as string[])
      : [],
    thumbnailUrl: input.thumbnailUrl,
    isHidden: Boolean(input.isHidden ?? false),

    viewCount: 0,
    likeCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/** 수정 입력(부분) → Firestore 업데이트 payload(다국어 객체 유지) */
export function mapUpdateInputToDoc(
  patch: UpdateWellnessInput
): Partial<WellnessDoc> {
  const data: Partial<WellnessDoc> = { updatedAt: serverTimestamp() };

  if (typeof patch.title !== "undefined")
    data.title = normalizeI18n(patch.title);
  if (typeof patch.excerpt !== "undefined")
    data.excerpt = normalizeI18n(patch.excerpt);
  if (typeof patch.body !== "undefined") data.body = normalizeI18n(patch.body);
  if (typeof patch.category === "string") data.category = patch.category;
  if (Array.isArray(patch.tags)) data.tags = patch.tags;
  if (typeof patch.thumbnailUrl === "string")
    data.thumbnailUrl = patch.thumbnailUrl;
  if (typeof patch.isHidden === "boolean") data.isHidden = patch.isHidden;

  return data;
}

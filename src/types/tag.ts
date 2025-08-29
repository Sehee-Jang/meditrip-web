// Admin/Client Timestamp를 모두 허용하는 합집합 타입을 정의
import type { Timestamp as ClientTimestamp } from "firebase/firestore";
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import type { LocaleKey } from "@/constants/locales";

// 양쪽 SDK Timestamp를 모두 수용
export type AnyTimestamp = ClientTimestamp | AdminTimestamp;

/** 태그가 속한 큰 분류(필요 없으면 undefined 가능) */
export type TagGroup = "focus" | "wellness" | "treatment";

/** ko/ja/zh/en 라벨 */
export type LocalizedTagLabel = Record<LocaleKey, string>;

/** Firestore 문서 본문 */
export interface TagDoc {
  labels: LocalizedTagLabel;
  group?: TagGroup;
  updatedAt?: AnyTimestamp;
}

/** Firestore 문서 본문 */
export interface TagWithId extends TagDoc {
  id: string;
  slug: string;
}

/** 병원 문서에 저장되는 태그 */
export type TagSlug = string;

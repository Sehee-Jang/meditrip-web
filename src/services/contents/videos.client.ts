"use client";

import {
  addDoc,
  collection,
  documentId,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  startAfter,
  Timestamp,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Video } from "@/types/video";
import type { CategoryKey } from "@/constants/categories";

type CursorPayload = { createdAtMs: number; id: string };

// 안전한 커서 인코딩/디코딩(브라우저만 사용)
const encodeCursor = (c: CursorPayload): string =>
  typeof window === "undefined" ? "" : btoa(JSON.stringify(c));
const decodeCursor = (s: string): CursorPayload =>
  JSON.parse(atob(s)) as CursorPayload;

// 유튜브 URL → videoId
export const parseYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // /shorts/{id}
      const m = u.pathname.match(/\/shorts\/([^/]+)/);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
};

export const makeYoutubeThumb = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

type FetchVideosOptions = {
  categories?: CategoryKey[];
  keyword?: string; // 현재는 클라이언트 측 포함 검색(간단 버전)
  limit?: number;
  cursor?: string; // encodeCursor로 받은 값
};

type FetchVideosResult = {
  items: Video[];
  nextCursor?: string;
};

// Firestore → Video 매핑
const mapDoc = (
  d: import("firebase/firestore").QueryDocumentSnapshot
): Video => {
  const data = d.data() as {
    title: string;
    youtubeUrl: string;
    thumbnailUrl: string;
    viewCount?: number;
    category: CategoryKey;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  };
  return {
    id: d.id,
    title: data.title,
    youtubeUrl: data.youtubeUrl,
    thumbnailUrl: data.thumbnailUrl,
    viewCount: data.viewCount,
    category: data.category,
    createdAt: data.createdAt
      ? new Date(data.createdAt.toMillis()).toISOString()
      : undefined,
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt.toMillis()).toISOString()
      : undefined,
  };
};

// 목록 조회(카테고리 in + 최신순 페이지네이션)
export async function fetchVideos(
  opts: FetchVideosOptions = {}
): Promise<FetchVideosResult> {
  const { categories = [], keyword = "", limit = 24, cursor } = opts;
  const col = collection(db, "videos");

  const qcs: QueryConstraint[] = [];
  // 정렬: createdAt desc, 동률 안정성 위해 문서 ID 2차 정렬
  qcs.push(orderBy("createdAt", "desc"), orderBy(documentId(), "desc"));

  if (categories.length > 0) {
    // Firestore in 쿼리는 최대 10개
    qcs.push(where("category", "in", categories.slice(0, 10)));
  }

  if (cursor) {
    const c = decodeCursor(cursor);
    qcs.push(startAfter(Timestamp.fromMillis(c.createdAtMs), c.id));
  }

  qcs.push(fsLimit(limit));

  const snap = await getDocs(query(col, ...qcs));
  let items = snap.docs.map(mapDoc);

  // 간이 검색: 제목/카테고리 포함 여부(서버 쿼리는 추후 토큰/Algolia로 고도화)
  const kw = keyword.trim().toLowerCase();
  if (kw) {
    items = items.filter(
      (v) =>
        v.title.toLowerCase().includes(kw) ||
        v.category.toLowerCase().includes(kw)
    );
  }

  const last = snap.docs[snap.docs.length - 1];
  const nextCursor =
    last && last.get("createdAt")
      ? encodeCursor({
          createdAtMs: (last.get("createdAt") as Timestamp).toMillis(),
          id: last.id,
        })
      : undefined;

  return { items, nextCursor };
}

// 단건 등록(관리자): URL로 등록하면 썸네일 자동 세팅
export async function addVideoFromUrl(input: {
  youtubeUrl: string;
  category: CategoryKey;
  title?: string;
}): Promise<string> {
  const { youtubeUrl, category, title } = input;
  const vid = parseYouTubeId(youtubeUrl);
  if (!vid) {
    throw new Error("유효한 YouTube URL이 아닙니다.");
  }
  const data = {
    title: title ?? `YouTube ${vid}`,
    youtubeUrl,
    thumbnailUrl: makeYoutubeThumb(vid),
    category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "videos"), data);
  return ref.id;
}

// 일괄 마이그레이션(mock → Firestore)
// - overwrite=true: 기존 필드 위에 병합 저장
// - useFixedId=true: mock id를 문서 ID로 그대로 사용(충돌 주의)
export async function migrateMockToFirestore(
  mock: Array<{
    id: number | string;
    title: string;
    youtubeUrl: string;
    thumbnail?: string;
    category: CategoryKey;
  }>,
  opts: { overwrite?: boolean; useFixedId?: boolean } = {}
): Promise<number> {
  const { overwrite = true, useFixedId = true } = opts;
  const batch = writeBatch(db);
  const col = collection(db, "videos");

  for (const m of mock) {
    const idStr = String(m.id);
    const vid = parseYouTubeId(m.youtubeUrl);
    const thumb = m.thumbnail ?? (vid ? makeYoutubeThumb(vid) : "");

    if (useFixedId) {
      const ref = doc(col, idStr);
      batch.set(
        ref,
        {
          title: m.title,
          youtubeUrl: m.youtubeUrl,
          thumbnailUrl: thumb,
          category: m.category,
          updatedAt: serverTimestamp(),
          // 새 문서일 경우 createdAt이 없으므로 set 시 항상 채워줌
          createdAt: serverTimestamp(),
        },
        { merge: overwrite }
      );
    } else {
      // auto-id: set 대신 add를 쓰고 싶지만, batch에는 add가 없어 set+doc() 사용
      const ref = doc(col);
      batch.set(ref, {
        title: m.title,
        youtubeUrl: m.youtubeUrl,
        thumbnailUrl: thumb,
        category: m.category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
  await batch.commit();
  return mock.length;
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  limit as fsLimit,
  Timestamp,
  CollectionReference,
  DocumentReference,
  WithFieldValue,
  UpdateData,
  startAfter,
  type QueryDocumentSnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Video } from "@/types/video";
import type { CategoryKey } from "@/constants/categories";

const COL = "videos";

/** Firestore 문서 스키마(저장 형태) */
type FireVideo = {
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  viewCount?: number;
  category: CategoryKey;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type CreateVideoInput = {
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  category: CategoryKey;
  viewCount?: number;
};

export type UpdateVideoInput = Partial<CreateVideoInput>;

/** 타입이 입혀진 참조들 */
const colRef = collection(db, COL) as CollectionReference<FireVideo>;
const docRef = (id: string) => doc(db, COL, id) as DocumentReference<FireVideo>;

/** Timestamp → ISO 문자열 */
function tsToIso(ts?: Timestamp): string | undefined {
  return ts ? ts.toDate().toISOString() : undefined;
}

/** QueryDocumentSnapshot → Video */
function mapQSnapToVideo(snap: QueryDocumentSnapshot<FireVideo>): Video {
  const data = snap.data();
  return {
    id: snap.id,
    title: data.title,
    youtubeUrl: data.youtubeUrl,
    thumbnailUrl: data.thumbnailUrl,
    viewCount: data.viewCount,
    category: data.category,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

/** DocumentSnapshot → Video (호출 전 exists() 체크 필요) */
function mapSnapToVideo(snap: DocumentSnapshot<FireVideo>): Video {
  const data = snap.data()!;
  return {
    id: snap.id,
    title: data.title,
    youtubeUrl: data.youtubeUrl,
    thumbnailUrl: data.thumbnailUrl,
    viewCount: data.viewCount,
    category: data.category,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

/** 생성 */
export async function createVideo(input: CreateVideoInput): Promise<string> {
  const data: WithFieldValue<FireVideo> = {
    title: input.title,
    youtubeUrl: input.youtubeUrl,
    thumbnailUrl: input.thumbnailUrl,
    viewCount: input.viewCount ?? 0,
    category: input.category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(colRef, data);
  return ref.id;
}

/** 목록 조회(최신순) */
export async function listVideos(opts?: { limit?: number }): Promise<Video[]> {
  const q = query(
    colRef,
    orderBy("createdAt", "desc"),
    fsLimit(opts?.limit ?? 50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapQSnapToVideo);
}

/** 단건 조회 */
export async function getVideoById(id: string): Promise<Video | null> {
  const s = await getDoc(docRef(id));
  if (!s.exists()) return null;
  return mapSnapToVideo(s);
}

/** 수정 */
export async function updateVideo(
  id: string,
  patch: UpdateVideoInput
): Promise<void> {
  const data: UpdateData<FireVideo> = {
    ...patch,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(docRef(id), data);
}

/** 삭제 */
export async function deleteVideo(id: string): Promise<void> {
  await deleteDoc(docRef(id));
}

/**
 * @deprecated 기존 코드 호환용 어댑터
 * 사용처를 점진적으로 listVideos로 교체하세요.
 */
export type FetchVideosOptions = {
  categories?: CategoryKey[];
  keyword?: string;
  limit?: number;
};

export async function fetchVideos(
  opts?: FetchVideosOptions
): Promise<{ items: Video[] }> {
  const items = await listVideos({ limit: opts?.limit ?? 50 });

  // 과거 시그니처 호환을 위한 클라이언트 측 필터링
  const kw = (opts?.keyword ?? "").trim().toLowerCase();
  let filtered = items;

  if (opts?.categories && opts.categories.length > 0) {
    const set = new Set<CategoryKey>(opts.categories);
    filtered = filtered.filter((v) => set.has(v.category));
  }
  if (kw.length > 0) {
    filtered = filtered.filter(
      (v) =>
        v.title.toLowerCase().includes(kw) ||
        v.category.toLowerCase().includes(kw)
    );
  }

  return { items: filtered };
}

// FireVideo 타입을 외부에서 쓸 수 있도록 export (커서 제네릭)
export type FireVideoAdminCursor = QueryDocumentSnapshot<FireVideo>;

// 페이지 단위 조회
export async function listVideosPage(
  limit: number,
  cursor?: QueryDocumentSnapshot<FireVideo>
): Promise<{ items: Video[]; cursor?: QueryDocumentSnapshot<FireVideo> }> {
  const base = [orderBy("createdAt", "desc")];
  const q = cursor
    ? query(colRef, ...base, startAfter(cursor), fsLimit(limit))
    : query(colRef, ...base, fsLimit(limit));

  const snap = await getDocs(q);
  const items = snap.docs.map(mapQSnapToVideo);
  const nextCursor = snap.docs.length
    ? (snap.docs[snap.docs.length - 1] as QueryDocumentSnapshot<FireVideo>)
    : undefined;
  return { items, cursor: nextCursor };
}

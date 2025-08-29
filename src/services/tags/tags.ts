"use client";

import * as React from "react";
import type { TagWithId} from "@/types/tag";

/** /api/tags 에서 받아오는 응답 타입 */
type TagsApiResponse = {
  ok: boolean;
  items?: TagWithId[];
  error?: string;
};

/** 클라이언트에서 서버 API 호출 */
export async function fetchTagsCatalog(): Promise<TagWithId[]> {
  const res = await fetch("/api/tags", { cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as TagsApiResponse;
  return json.ok && Array.isArray(json.items) ? json.items : [];
}

/** React 훅: 태그 카탈로그 */
export function useTagsCatalog() {
  const [data, setData] = React.useState<TagWithId[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTagsCatalog()
      .then((items) => {
        if (!mounted) return;
        setData(items);
        setError(null);
      })
      .catch((e) => {
        console.error("useTagsCatalog:", e);
        if (!mounted) return;
        setError("failed");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

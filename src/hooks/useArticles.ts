"use client";

import { useQuery } from "@tanstack/react-query";
import { listArticles } from "@/services/articles/listArticles";
import { getArticleById } from "@/services/articles/getArticleById";
import { normalizeArticles } from "@/utils/articles";
import type { Article } from "@/types/articles";

type ListOpts = { includeHidden?: boolean; limit?: number };

export function useArticles(opts?: ListOpts) {
  return useQuery({
    queryKey: ["articles", opts],
    queryFn: async () => {
      const res = await listArticles(opts);
      const rows = normalizeArticles(res);
      return opts?.includeHidden ? rows : rows.filter((r) => !r.isHidden);
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useArticle(id: string) {
  return useQuery<Article | null>({
    queryKey: ["article", id],
    queryFn: () => getArticleById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3,
  });
}

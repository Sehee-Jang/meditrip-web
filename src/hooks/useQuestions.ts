"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit as fsLimit,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import type { Question } from "@/types/question";
import type { CommunityCategory } from "@/types/category";
import { COMMUNITY_CATEGORY_KEYS } from "@/constants/communityCategories";
import { toISO } from "@/utils/date";

type FirestoreQuestionDoc = {
  title: string;
  content: string;
  category: CommunityCategory | string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  imageUrl?: string;
  userId?: string;
  answersCount?: number;
  hasAnswer?: boolean;
  isHidden?: boolean;
};

function normalizeCategory(input: unknown): CommunityCategory {
  const v = typeof input === "string" ? input : String(input ?? "");
  const ok = (COMMUNITY_CATEGORY_KEYS as readonly string[]).includes(v);
  // 기본값: 첫 번째 키(프로젝트에서 가장 일반적인 카테고리)
  return (ok ? v : COMMUNITY_CATEGORY_KEYS[0]) as CommunityCategory;
}

export function useQuestions(limitCount = 2) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchQuestions = async () => {
      try {
        setLoading(true);

        const qRef = query(
          collection(db, "questions"),
          orderBy("createdAt", "desc"),
          fsLimit(limitCount)
        );

        const snapshot = await getDocs(qRef);

        const items: Question[] = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data() as FirestoreQuestionDoc;

          const createdAtISO = toISO(raw.createdAt);
          const updatedAtISO = toISO(raw.updatedAt);
          const answersCount =
            typeof raw.answersCount === "number" ? raw.answersCount : 0;
          const hasAnswer =
            typeof raw.hasAnswer === "boolean"
              ? raw.hasAnswer
              : answersCount > 0;

          return {
            id: docSnap.id,
            title: String(raw.title ?? ""),
            content: String(raw.content ?? ""),
            category: normalizeCategory(raw.category),
            createdAt: createdAtISO || updatedAtISO || new Date().toISOString(),
            updatedAt: updatedAtISO || createdAtISO || new Date().toISOString(),
            imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
            userId: String(raw.userId ?? ""),
            answersCount,
            hasAnswer,
            isHidden: Boolean(raw.isHidden ?? false),
          };
        });

        if (!alive) return;
        setQuestions(items);
      } catch (error) {
        // 콘솔만 남기고, 사용자 노출 문구는 i18n 사용하는 화면에서 처리
        // eslint-disable-next-line no-console
        console.error("Failed to fetch questions:", error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void fetchQuestions();
    return () => {
      alive = false;
    };
  }, [limitCount]);

  return { questions, loading };
}

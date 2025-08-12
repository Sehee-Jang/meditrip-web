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

type FirestoreQuestionDoc = {
  title: string;
  content: string;
  category: CommunityCategory | string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  imageUrl?: string;
  userId?: string;
  answersCount?: number;
  isHidden?: boolean;
};

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

          const createdAt = raw.createdAt?.toDate().toISOString() ?? "";
          const updatedAt = raw.updatedAt?.toDate().toISOString() ?? undefined;

          return {
            id: docSnap.id,
            title: raw.title,
            content: raw.content,
            category: raw.category as Question["category"],
            createdAt,
            updatedAt,
            imageUrl: raw.imageUrl,
            userId: raw.userId ?? "", // 매우 오래된 문서 대비
            answersCount:
              typeof raw.answersCount === "number" ? raw.answersCount : 0,
            isHidden: typeof raw.isHidden === "boolean" ? raw.isHidden : false,
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

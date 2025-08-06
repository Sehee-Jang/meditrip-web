"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { Question } from "@/types/question";
import type { User } from "@/types/user";

export function useQuestions(limitCount = 2) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Questions:", questions); // 🔍 user?.nickname 확인
  }, [questions]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, "questions"),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);

        const enrichedQuestions: Question[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let user = null;

            if (data.userId) {
              const userRef = doc(db, "users", data.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                user = userSnap.data() as User;
                console.log("Fetched user:", user);
              }
            }

            return {
              id: docSnap.id,
              ...data,
              user, // 유저 정보 포함
            } as Question;
          })
        );

        setQuestions(enrichedQuestions);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [limitCount]);

  return { questions, loading };
}

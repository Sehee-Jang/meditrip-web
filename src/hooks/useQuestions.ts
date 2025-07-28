"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { Question } from "@/types/Question";

export function useQuestions(limitCount = 2) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const q = query(
        collection(db, "questions"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];
      setQuestions(data);
      setLoading(false);
    }

    fetchQuestions();
  }, [limitCount]);

  return { questions, loading };
}

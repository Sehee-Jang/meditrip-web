"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import Container from "@/components/common/Container";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MyFavoriteClinics from "@/components/mypage/MyFavoriteClinics";
import type { Reservation, MyQuestion } from "@/types/mypage";

// 섹션 컴포넌트
import ProfileHeader from "./sections/ProfileHeader";
import ReservationsSection from "./sections/ReservationsSection";
import PointsSection from "./sections/PointsSection";
import QuestionsSection from "./sections/QuestionsSection";
import ActionBar from "./sections/ActionBar";

interface QuestionData {
  title: string;
  createdAt: Timestamp;
  answers?: unknown[];
  answersCount?: number;
}

export default function MyPageContent() {
  const t = useTranslations("mypage");
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [nickname, setNickname] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [questions, setQuestions] = useState<MyQuestion[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u || u.isAnonymous) {
        router.replace("/");
        setCheckingAuth(false);
        return;
      }

      // 1) 프로필/포인트
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setNickname((data.nickname as string) || u.displayName || "");
        setPoints((data.points as number) || 0);
      }

      // 2) 예약
      const resSnap = await getDocs(
        query(collection(db, "reservations"), where("user.id", "==", u.uid))
      );
      setReservations(
        resSnap.docs.map((d) => {
          const dt = (d.data().date as Timestamp).toDate();
          return {
            id: d.id,
            hospital: d.data().hospital as string,
            date: dt.toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: d.data().status as string,
          };
        })
      );

      // 3) 질문
      const qSnap = await getDocs(
        query(
          collection(db, "questions"),
          where("userId", "==", u.uid),
          orderBy("createdAt", "desc")
        )
      );

      const questionItems: MyQuestion[] = await Promise.all(
        qSnap.docs.map(async (d) => {
          const data = d.data() as QuestionData;
          const created = data.createdAt.toDate();

          let answered = false;
          if (typeof data.answersCount === "number") {
            answered = data.answersCount > 0;
          } else if (Array.isArray(data.answers)) {
            answered = data.answers.length > 0;
          } else {
            const cntSnap = await getCountFromServer(
              collection(db, "questions", d.id, "answers")
            );
            answered = cntSnap.data().count > 0;
          }

          return {
            id: d.id,
            title: data.title,
            date: `${created.getFullYear()}.${String(
              created.getMonth() + 1
            ).padStart(2, "0")}.${String(created.getDate()).padStart(2, "0")}`,
            answered,
          };
        })
      );

      setQuestions(questionItems);
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/");
  };

  if (checkingAuth) {
    return (
      <div className='min-h-[50vh] flex flex-col items-center justify-center'>
        <LoadingSpinner />
        <p className='mt-4 text-gray-500'>{t("loading")}</p>
      </div>
    );
  }

  return (
    <Container className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
      {/* 인삿말 */}
      <ProfileHeader name={nickname} />

      <div className='space-y-10'>
        {/* 예약 내역 */}
        <ReservationsSection reservations={reservations} />

        {/* 찜한 병원 */}
        <MyFavoriteClinics />

        {/* 포인트 */}
        <PointsSection points={points} />

        {/* 내가 작성한 질문 */}
        <QuestionsSection questions={questions} />

        {/* 로그아웃·설정 */}
        <ActionBar onLogout={signOut} settingsHref='/mypage/settings' />
      </div>
    </Container>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
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
  const pathname = usePathname();
  const currentLocale = useLocale();

  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [photoURL, setPhotoURL] = useState<string | undefined>();
  const [nickname, setNickname] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [questions, setQuestions] = useState<MyQuestion[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u || u.isAnonymous) {
        router.replace("/", { locale: "ko" }); // 👈 명시
        setCheckingAuth(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", u.uid));
      let preferredLocale: "ko" | "ja" | undefined;

      if (userDoc.exists()) {
        const data = userDoc.data() as {
          profileImage?: string;
          nickname?: string;
          points?: number;
          preferredLocale?: "ko" | "ja";
        };
        setPhotoURL((data.profileImage as string) || u.photoURL || undefined);
        setNickname((data.nickname as string) || u.displayName || "");
        setPoints((data.points as number) || 0);
        preferredLocale = data.preferredLocale;
      }

      // 예약
      const resSnap = await getDocs(
        query(collection(db, "reservations"), where("user.id", "==", u.uid))
      );
      setReservations(
        resSnap.docs.map((d) => {
          const dt = (d.data().date as Timestamp).toDate();
          return {
            id: d.id,
            clinic: d.data().clinic as string,
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

      // 질문
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

      // 로그인 상태에서만 선호 언어 강제 적용
      if (preferredLocale && preferredLocale !== currentLocale) {
        document.cookie = `NEXT_LOCALE=${preferredLocale}; path=/; max-age=31536000; samesite=lax`;
        router.replace(pathname, { locale: preferredLocale });
        return;
      }

      setQuestions(questionItems);
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [router, pathname, currentLocale]);

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0; samesite=lax";
    router.push("/", { locale: "ko" });
  };

  if (checkingAuth) {
    return (
      <div className='min-h-[50vh] flex flex-col items-center justify-center'>
        <LoadingSpinner />
        <p className='mt-4 text-muted-foreground'>{t("loading")}</p>
      </div>
    );
  }

  return (
    <Container>
      {/* 인삿말 */}
      <ProfileHeader
        name={nickname}
        photoURL={photoURL}
        onAvatarUpdated={(url) => setPhotoURL(url)}
      />

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

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
} from "firebase/firestore";
import CommonButton from "@/components/common/CommonButton";
import Container from "@/components/common/Container";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ChevronRight } from "lucide-react";
import MyFavoriteClinics from "@/components/mypage/MyFavoriteClinics";
import UserPointLogDialog from "@/components/mypage/UserPointLogDialog";

interface Reservation {
  id: string;
  hospital: string;
  date: string;
  status: string;
}
interface MyQuestion {
  id: string;
  title: string;
  date: string;
  answered: boolean;
}

interface QuestionData {
  title: string;
  createdAt: Timestamp;
  answers?: unknown[];
}

export default function MyPageContent() {
  const t = useTranslations("mypage");
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [nickname, setNickname] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [questions, setQuestions] = useState<MyQuestion[]>([]);

  const [showPointLog, setShowPointLog] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && !u.isAnonymous) {
        // 1) 프로필 · 포인트 로드
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.nickname || u.displayName || "");
          setPoints(data.points || 0);
        }

        // 2) 예약 내역 로드
        const resSnap = await getDocs(
          query(collection(db, "reservations"), where("user.id", "==", u.uid))
        );
        setReservations(
          resSnap.docs.map((d) => {
            const dt = (d.data().date as Timestamp).toDate();
            return {
              id: d.id,
              hospital: d.data().hospital,
              date: dt.toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: d.data().status,
            };
          })
        );

        // 3) 질문 내역 로드
        const qSnap = await getDocs(
          query(
            collection(db, "questions"),
            where("userId", "==", u.uid),
            orderBy("createdAt", "desc")
          )
        );

        setQuestions(
          qSnap.docs.map((d) => {
            const data = d.data() as QuestionData;
            const created = data.createdAt.toDate();
            return {
              id: d.id,
              title: data.title,
              date: `${created.getFullYear()}.${String(
                created.getMonth() + 1
              ).padStart(2, "0")}.${String(created.getDate()).padStart(
                2,
                "0"
              )}`,
              answered: Array.isArray(data.answers) && data.answers.length > 0,
            };
          })
        );
      } else {
        // 미로그인 상태라면 홈으로 보냄
        router.replace("/");
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className='min-h-[50vh] flex flex-col items-center justify-center'>
        <LoadingSpinner />
        <p className='mt-4 text-gray-500'>{t("loading")}</p>
      </div>
    );
  }

  return (
    <Container>
      {/* 인삿말 */}
      <div className='flex items-center gap-4 mb-6'>
        <div className='w-12 h-12 rounded-full bg-gray-300' />
        <p className='text-lg font-medium'>
          {t("greeting", { name: nickname })}
        </p>
      </div>

      {/* 예약 내역 */}
      <section className='mb-12'>
        <h2 className='text-xl font-semibold mb-4'>
          {t("reservations.title")}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {reservations.map((r) => (
            <div
              key={r.id}
              className='border rounded p-4 bg-white flex flex-col gap-2'
            >
              <div className='font-medium'>{r.hospital}</div>
              <div>
                {t("reservations.datetime")}: {r.date}
              </div>
              <div>
                {t("reservations.status")}:{" "}
                {r.status === "completed"
                  ? t("reservations.completed")
                  : t("reservations.pending")}
              </div>
              <div className='flex gap-2'>
                <CommonButton className='text-sm'>
                  {t("reservations.details")}
                </CommonButton>
                <CommonButton className='text-sm bg-white text-black border hover:bg-gray-100'>
                  {t("reservations.modify")}
                </CommonButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 찜한 병원 */}
      <MyFavoriteClinics />

      {/* 포인트 */}
      <section className='mb-12'>
        <div className='flex justify-between'>
          <h2 className='text-xl font-bold mb-4'>{t("points.title")}</h2>
          {/* 포인트 사용 내역 버튼 */}
          <CommonButton
            onClick={() => setShowPointLog(true)}
            className='rounded border px-2 py-1 text-sm bg-white text-gray-800 hover:bg-gray-100'
          >
            {t("points.use")} <ChevronRight size={16} />
          </CommonButton>
        </div>
        <div className='border p-4 rounded-md bg-white flex justify-between items-center'>
          <p className='text-gray-700'>{t("points.status")}</p>
          <p className='font-medium'>
            {t("points.amount", { amount: points })}
          </p>
        </div>
      </section>

      {/* 모달 */}
      <UserPointLogDialog
        open={showPointLog}
        onClose={() => setShowPointLog(false)}
      />

      {/* 내가 작성한 질문 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4'>{t("questions.title")}</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {questions.map((q) => (
            <Link href={`/community/questions/${q.id}`} key={q.id}>
              <div className='border p-4 rounded-md bg-white hover:shadow-md transition'>
                <div className='font-medium'>{q.title}</div>
                <div className='text-sm text-gray-600'>
                  {t("questions.writtenDate")}: {q.date}
                </div>
                <div className='text-sm font-semibold'>
                  {t("questions.status")}:{" "}
                  {q.answered ? (
                    <span className='text-green-600'>
                      {t("questions.answered")}
                    </span>
                  ) : (
                    <span className='text-red-500'>
                      {t("questions.pending")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 로그아웃·설정 */}
      <div className='hidden md:flex justify-end gap-2 mt-12'>
        <CommonButton
          className='text-sm bg-white text-black border'
          onClick={async () => {
            await signOut(auth);
            router.push("/");
          }}
        >
          {t("buttons.logout")}
        </CommonButton>

        <Link href='/mypage/settings' className='w-1/2'>
          <CommonButton className='text-sm'>
            {t("buttons.settings")}
          </CommonButton>
        </Link>
      </div>

      {/* 로그아웃·설정 (모바일) */}
      <div className='flex md:hidden justify-between gap-2 mb-8'>
        <CommonButton
          className='w-1/2 text-sm bg-white text-black border hover:bg-gray-100'
          onClick={async () => {
            await signOut(auth);
            router.push("/");
          }}
        >
          {t("buttons.logout")}
        </CommonButton>

        <Link href='/mypage/settings' className='w-1/2'>
          <CommonButton className='w-full text-sm'>
            {t("buttons.settings")}
          </CommonButton>
        </Link>
      </div>
    </Container>
  );
}

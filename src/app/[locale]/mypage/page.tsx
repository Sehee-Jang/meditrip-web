import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import CommonButton from "@/components/layout/CommonButton";
import Container from "@/components/layout/Container";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function MyPage() {
  const t = await getTranslations("MyPage");

  // 예시 데이터

  const name = "소라맘";
  const amount = 12000;

  const reservations = [
    {
      id: 1,
      hospital: "우주연 한의원",
      date: "2025.08.01 14:00",
      status: "completed",
    },
    {
      id: 2,
      hospital: "하늘 한의원",
      date: "2025.08.05 10:00",
      status: "pending",
    },
  ];

  const questions = [
    { id: 1, title: "한약 복용법은?", date: "2025.07.15", status: "답변 완료" },
    { id: 2, title: "한의학의 장점은?", date: "2025.06.20", status: "미답변" },
  ];

  return (
    <main className='max-w-4xl mx-auto md:px-4 md:py-8'>
      <PageHeader
        desktopTitle={t("title")}
        mobileTitle={t("title")}
        showBackIcon
        center
      />

      <Container>
        {/* 인삿말 */}
        <div className='flex items-center gap-4 mb-6'>
          <div className='w-12 h-12 rounded-full bg-gray-300' />
          <p className='text-lg font-medium'>{t("greeting", { name })}</p>
        </div>

        {/* 나의 예약 내역 */}
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

        {/* 적립 포인트 */}
        <section className='mb-12'>
          <div className='flex justify-between'>
            <h2 className='text-xl font-bold mb-4'>{t("points.title")}</h2>
            <CommonButton className='rounded border border-gray-800 px-2 py-1 text-sm bg-white text-gray-800 border hover:bg-gray-100 '>
              {t("points.use")}
              <ChevronRight size={16} />
            </CommonButton>
          </div>

          <div className='border p-4 rounded-md bg-white flex justify-between items-center'>
            <p className='text-gray-700'>{t("points.status")}</p>
            <p className='font-medium'>{t("points.amount", { amount })}</p>
          </div>
        </section>

        {/* 내가 작성한 질문 */}
        <section className='mb-8'>
          <h2 className='text-xl font-bold mb-4'>{t("questions.title")}</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {questions.map((q) => (
              <div key={q.id} className='border p-4 rounded-md bg-white'>
                <div className='font-medium'>{q.title}</div>
                <div className='text-sm text-gray-600'>
                  {t("questions.writtenDate")}: {q.date}
                </div>
                <div className='text-sm font-semibold'>
                  {t("questions.status")}:{" "}
                  {q.status === "답변 완료" ? (
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
            ))}
          </div>
        </section>

        {/* 로그아웃 및 설정 버튼 */}
        <div className='hidden md:flex justify-end gap-2 mt-12'>
          <CommonButton className='text-sm bg-white text-black border'>
            {t("buttons.logout")}
          </CommonButton>
          <Link href='/mypage/settings' className='w-1/2'>
            <CommonButton className='text-sm'>
              {t("buttons.settings")}
            </CommonButton>
          </Link>
        </div>

        {/* 모바일 */}
        <div className='flex md:hidden justify-between gap-2 mb-8'>
          <CommonButton className='w-1/2 text-sm bg-white text-black border hover:bg-gray-100'>
            {t("buttons.logout")}
          </CommonButton>

          <Link href='/mypage/settings' className='w-1/2'>
            <CommonButton className='w-full text-sm'>
              {t("buttons.settings")}
            </CommonButton>
          </Link>
        </div>
      </Container>
    </main>
  );
}

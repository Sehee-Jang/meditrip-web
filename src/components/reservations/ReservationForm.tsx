"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createReservation,
  NewReservation,
} from "@/services/reservations/createReservation";
import CommonInput from "@/components/common/CommonInput";
import CommonButton from "@/components/common/CommonButton";
import countryList from "react-select-country-list";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface ReservationFormProps {
  locale: string;
  clinicId: string;
  packageId: string;
  clinicName: string;
  packageName: string;
}

export default function ReservationForm({
  locale,
  clinicId,
  packageId,
  clinicName,
  packageName,
}: ReservationFormProps) {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [nationality, setNationality] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 로그인한 사용자의 이름을 기본값으로 설정
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPatientName(user.displayName || user.email || "");
      }
    });
    return unsubscribe;
  }, []);

  // react-select-country-list 을 사용해 국가 옵션 생성
  const countryOptions = useMemo(() => countryList().getData(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const newRes: NewReservation = {
      patientName,
      nationality,
      clinicId,
      packageId,
      clinicName,
      packageName,
      date,
      time,
      notes,
    };

    try {
      const id = await createReservation(newRes);
      toast.success("예약이 완료되었습니다!");
      router.push(`/${locale}/reservations/complete?reservationId=${id}`);
    } catch (error) {
      console.error(error);
      toast.error("예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <CommonInput
        label='환자 성함'
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
        required
      />
      {/* <CommonInput
        label='국적'
        value={nationality}
        onChange={(e) => setNationality(e.target.value)}
        required
      /> */}

      {/* 국가 선택 드롭다운 */}
      <div className='flex flex-col space-y-1'>
        <label
          htmlFor='nationality'
          className='text-sm font-medium text-gray-700'
        >
          국적<span className='text-red-500'> *</span>
        </label>
        <select
          id='nationality'
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          required
          className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
        >
          <option value=''>국적 선택</option>
          {countryOptions.map((c) => (
            <option key={c.value} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <CommonInput label='병원명' value={clinicName} disabled />
      <CommonInput label='진료 패키지' value={packageName} disabled />
      <CommonInput
        label='예약 날짜'
        type='date'
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <CommonInput
        label='예약 시간'
        type='time'
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <div className='flex flex-col space-y-1'>
        <label className='text-sm font-medium text-gray-700'>요청사항</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='추가 요청사항을 입력하세요'
          className='w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
          rows={3}
        />
      </div>
      <CommonButton type='submit' disabled={submitting} className='w-full'>
        {submitting ? "제출 중..." : "예약 완료"}
      </CommonButton>
    </form>
  );
}

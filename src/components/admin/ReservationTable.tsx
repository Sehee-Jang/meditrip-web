"use client";

import React, { useEffect, useState } from "react";
import {
  getReservations,
  Reservation,
} from "@/services/reservations/getReservations";
import { format } from "date-fns";

export default function ReservationsTable() {
  const [data, setData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReservations()
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>불러오는 중…</p>;
  if (error) return <p className='text-red-600'>에러: {error}</p>;

  return (
    <div className='overflow-auto bg-white rounded-lg shadow'>
      <div className='rounded-2xl border bg-white shadow-sm'>
        <table className='min-w-full table-auto'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2 text-left'>예약번호</th>
              <th className='px-4 py-2 text-left'>환자명</th>
              <th className='px-4 py-2 text-left'>국적</th>
              <th className='px-4 py-2 text-left'>병원명</th>
              <th className='px-4 py-2 text-left'>예약내용</th>
              <th className='px-4 py-2 text-left'>상태</th>
              <th className='px-4 py-2 text-left'>예약일시</th>
              <th className='px-4 py-2 text-left'>작업</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className='border-t'>
                <td className='px-4 py-2'>#{r.id.slice(-4)}</td>
                <td className='px-4 py-2'>{r.patientName}</td>
                <td className='px-4 py-2'>{r.nationality}</td>
                <td className='px-4 py-2'>{r.hospitalName}</td>
                <td className='px-4 py-2'>{r.packageName}</td>
                <td className='px-4 py-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-sm 
                ${r.status === "예약" ? "bg-green-100 text-green-800" : ""}
                ${r.status === "취소" ? "bg-red-100 text-red-800" : ""}
                ${r.status === "완료" ? "bg-gray-100 text-gray-800" : ""}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className='px-4 py-2'>
                  {format(r.reservedAt.toDate(), "yyyy-MM-dd HH:mm")}
                </td>
                <td className='px-4 py-2'>
                  <button className='text-blue-600 hover:underline'>
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

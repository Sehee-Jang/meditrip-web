"use client";

import React from "react";
import { MapPin } from "lucide-react";
import type { Hospital, HospitalPackage } from "@/types/Hospital";

interface DetailProps {
  hospital: Hospital; // name, address 포함된 static + 번역 데이터
  vision: string;
  mission: string;
  description: string;
  events: string[];
  packagesTitle: string;
  packages: HospitalPackage[];
}

export default function HospitalDetailClient({
  hospital,
  vision,
  mission,
  description,
  events,
  packagesTitle,
  packages,
}: DetailProps) {
  return (
    <div className='px-4 py-6 space-y-6'>
      {/* 주소 */}
      <p className='flex items-center text-sm text-gray-500'>
        <MapPin className='w-4 h-4 mr-1' />
        {hospital.address}
      </p>

      {/* 비전 / 미션 */}
      <section>
        <h2 className='text-lg font-semibold'>{vision}</h2>
        <p className='mt-2 text-gray-700'>{mission}</p>
      </section>

      {/* 설명 */}
      <section>
        <h3 className='text-lg font-semibold'>설명</h3>
        <p className='mt-2 text-gray-700'>{description}</p>
      </section>

      {/* 예약 이벤트 */}
      <section>
        <h3 className='text-lg font-semibold'>예약 이벤트</h3>
        <ul className='list-disc ml-5 mt-2 text-gray-700'>
          {events.map((ev, idx) => (
            <li key={idx}>{ev}</li>
          ))}
        </ul>
      </section>

      {/* 진료 패키지 */}
      <section>
        <h3 className='text-lg font-semibold'>{packagesTitle}</h3>
        <div className='grid grid-cols-1 gap-4 mt-2'>
          {packages.map((pkg, idx) => (
            <div key={idx} className='border rounded-xl p-4'>
              <h4 className='font-medium'>{pkg.title}</h4>
              <p className='mt-1 text-sm'>
                {pkg.price} · {pkg.duration}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

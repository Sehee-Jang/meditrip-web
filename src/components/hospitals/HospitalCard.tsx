"use client";

import React from "react";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Hospital } from "@/types/Hospital";
import Image from "next/image";

interface HospitalCardProps {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const t = useTranslations("hospitalList");
  const name = t(`${hospital.id}.name`);
  const address = t(`${hospital.id}.addressShort`);

  return (
    <Link
      href={`/hospital/${hospital.id}`}
      className='
        flex items-center space-x-4
        bg-white rounded-2xl shadow p-4
        hover:shadow-md transition
      '
    >
      <Image
        src={hospital.photos[0] ?? "/placeholder.png"}
        alt={hospital.name}
        width={80} // w-20 ⇒ 80px
        height={80} // h-20 ⇒ 80px
        className='rounded-lg object-cover'
      />
      <div className='flex-1'>
        <h3 className='text-base font-semibold text-gray-900'>{name}</h3>
        <p className='mt-1 text-sm text-gray-500 flex items-center'>
          <MapPin className='w-4 h-4 mr-1' /> {address}
        </p>
        <p className='mt-1 text-sm text-gray-500'>
          ⭐ {hospital.rating ?? "-"} ({hospital.reviewCount ?? 0})
        </p>
      </div>
      <button className='p-2'>
        <Heart
          className={
            hospital.isFavorite
              ? "w-6 h-6 text-red-500"
              : "w-6 h-6 text-gray-300"
          }
        />
      </button>
    </Link>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  desktopTitle: string;
  mobileTitle: string;
  showBackIcon?: boolean;
  center?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({
  desktopTitle,
  mobileTitle,
  showBackIcon = false,
  center = false,
  children,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* 모바일 헤더 */}
      <div className='flex md:hidden w-full shadow-md items-center justify-between py-3 px-4 mb-4'>
        <div className='flex items-center gap-2'>
          {showBackIcon && (
            <button
              onClick={handleBack}
              className='p-2 rounded-lg hover:bg-gray-100 transition'
              aria-label='뒤로가기'
            >
              <ChevronLeft className='w-6 h-6' />
            </button>
          )}
          <h1 className='text-xl font-bold'>{mobileTitle}</h1>
        </div>
        {children && <div className='ml-auto'>{children}</div>}
      </div>

      {/* 데스크탑 헤더 */}
      <div
        className={`hidden md:flex items-center justify-between mx-4 md:mx-40 my-16 ${
          center ? "justify-center" : ""
        }`}
      >
        {/* 왼쪽 공간(비움) */}
        <div className='w-6' />

        {/* 가운데 병원명 */}
        <h1 className='md:text-4xl font-bold text-center flex-1'>
          {desktopTitle}
        </h1>

        {/* 오른쪽 찜 버튼 */}
        {children && <div>{children}</div>}
      </div>
    </>
  );
}

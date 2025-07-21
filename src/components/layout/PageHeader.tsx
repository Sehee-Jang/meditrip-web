import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  desktopTitle: string;
  mobileTitle: string;
  showBackIcon?: boolean;
  center?: boolean;
}

export default function PageHeader({
  desktopTitle,
  mobileTitle,
  showBackIcon = false,
  center = false,
}: PageHeaderProps) {
  return (
    <>
      {/* 모바일 헤더 */}
      <h1 className='flex md:hidden w-full shadow-md text-xl font-bold items-center gap-2 py-3 px-4 mb-4'>
        {showBackIcon && <ChevronLeft size={24} />}
        {mobileTitle}
      </h1>

      {/* 데스크탑 헤더 */}
      <h1
        className={`hidden md:block md:text-4xl font-bold ${
          center ? "text-center" : ""
        } my-16 mx-4 md:mx-40`}
      >
        {desktopTitle}
      </h1>
    </>
  );
}

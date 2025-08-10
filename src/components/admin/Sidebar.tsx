"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  MessageCircleMore,
  UserIcon,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Gift,
  Youtube,
} from "lucide-react";
import { useState } from "react";

const MENU = [
  { href: "", label: "대시보드", icon: HomeIcon },
  { href: "reservations", label: "예약 관리", icon: CalendarIcon },
  { href: "contents", label: "컨텐츠 관리", icon: Youtube },
  { href: "community", label: "1:1 상담 관리", icon: MessageCircleMore },
  { href: "users", label: "회원 관리", icon: UserIcon },
  { href: "event", label: "이벤트 관리", icon: CalendarCheck },
  { href: "points", label: "포인트 관리", icon: Gift },
];

type Props = { locale: string };

export default function Sidebar({ locale }: Props) {
  const path = usePathname();
  const segments = path.split("/");
  const activeSegment = segments[3] || "";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`
        h-full bg-white border-r
        flex flex-col 
        transition-width duration-200
        ${collapsed ? "w-16 justify-center items-center" : "w-64"}
      `}
    >
      {/* 상단: 로고 + 토글 */}
      <div
        className={`
          flex items-center justify-between
          px-6 py-4 
        `}
      >
        <Link
          href={`/${locale}/admin`}
          className={collapsed ? "rounded" : "text-xl font-bold"}
          aria-label='관리자 대시보드로 이동'
        >
          {!collapsed && <span className='text-xl font-bold'>메디트립</span>}
        </Link>

        {/* {!collapsed && <span className='text-xl font-bold'>메디트립</span>} */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className='p-1 rounded hover:bg-gray-100'
          aria-label={collapsed ? "사이드바 확장" : "사이드바 축소"}
        >
          {collapsed ? (
            <ChevronRight className='w-5 h-5' />
          ) : (
            <ChevronLeft className='w-5 h-5' />
          )}
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <ul className='flex-1 mt-4'>
        {MENU.map(({ href, label, icon: Icon }) => {
          const isActive = href === activeSegment;
          const linkPath =
            href === "" ? `/${locale}/admin` : `/${locale}/admin/${href}`;

          return (
            <li key={href}>
              <Link
                href={linkPath}
                className={`
                  flex items-center
                  ${collapsed ? "justify-center" : "px-6"}
                  py-3 hover:bg-gray-100  transition-colors
                  ${isActive ? "bg-blue-50 font-medium" : "text-gray-700"}
                 
                `}
              >
                <Icon className='w-5 h-5' />
                {!collapsed && <span className='ml-3'>{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 로그아웃 */}
      <div className='p-4 border-t'>
        <button
          className={`
            flex items-center justify-center
            w-full py-2 rounded hover:bg-gray-100
            text-red-600
          `}
        >
          {/* collapsed 시에도 아이콘만 보여줄 수도 있습니다 */}
          {!collapsed ? (
            "로그아웃"
          ) : (
            <ChevronLeft className='w-5 h-5 rotate-180' />
          )}
        </button>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  MessageCircleMore,
  UserIcon,
} from "lucide-react";

const MENU = [
  { href: "dashboard", label: "대시보드", icon: HomeIcon },
  { href: "reservations", label: "예약 관리", icon: CalendarIcon },
  { href: "consultations", label: "1:1 상담 관리", icon: MessageCircleMore },
  { href: "users", label: "회원 관리", icon: UserIcon },
];

type Props = { locale: string };

export default function Sidebar({ locale }: Props) {
  const path = usePathname();

  return (
    <nav className='w-64 bg-white border-r'>
      <div className='p-6 text-xl font-bold'>메디트립 시스템</div>
      <ul>
        {MENU.map(({ href, label, icon: Icon }) => {
          const isActive = path.includes(`/admin/${href}`);
          return (
            <li key={href}>
              <Link
                href={`/${locale}/admin/${href}`}
                className={
                  "flex items-center px-6 py-3 hover:bg-gray-100 " +
                  (isActive ? "bg-blue-50 font-medium" : "text-gray-700")
                }
              >
                <Icon className='w-5 h-5 mr-3' />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className='mt-auto p-6'>
        <button className='w-full text-left text-red-600'>로그아웃</button>
      </div>
    </nav>
  );
}

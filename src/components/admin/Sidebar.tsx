"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  MessageCircleMore,
  UserIcon,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Hospital,
  Youtube,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

type MenuItem = {
  href: string; // "" | "reservations" | ...
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean; // ← true 이면 정확히 일치할 때만 활성화
};

const MENU: ReadonlyArray<MenuItem> = [
  { href: "", label: "대시보드", icon: HomeIcon, exact: true },
  { href: "users", label: "회원 관리", icon: UserIcon },
  { href: "reservations", label: "예약 관리", icon: CalendarIcon },
  { href: "contents", label: "컨텐츠 관리", icon: Youtube },
  { href: "community", label: "1:1 상담 관리", icon: MessageCircleMore },
  { href: "clinics", label: "병원 관리", icon: Hospital },
  { href: "event", label: "이벤트 관리", icon: CalendarCheck },
];

const itemPath = (href: string) => (href === "" ? "/admin" : `/admin/${href}`);
const normalize = (p: string) =>
  p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;

export default function Sidebar() {
  const router = useRouter();
  const pathname = normalize(usePathname());
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // 로그인 상태 구독
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    const target = itemPath(href);
    if (exact) return pathname === target;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  // 로그인 핸들러
  const handleLogin = () => {
    // 이미 로그인 페이지면 굳이 push 안 해도 됨
    if (pathname !== "/admin/login") {
      router.push(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      router.replace(`/admin/login`);
    } catch (err) {
      console.error(err);
    } finally {
      // 상태 복구 (레이아웃이 그대로일 때 대비)
      setSigningOut(false);
    }
  };

  return (
    <nav
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-full bg-white border-r flex flex-col transition-[width]`}
    >
      {/* 상단: 로고 + 토글 */}
      <div className='flex items-center justify-between px-6 py-4'>
        <Link
          href='/admin'
          className={collapsed ? "rounded" : "text-xl font-bold py-0"}
        >
          {" "}
          {!collapsed && "메디트립"}{" "}
        </Link>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className='p-1 rounded hover:bg-gray-100'
          aria-label='사이드바 토글'
        >
          {collapsed ? (
            <ChevronRight className='w-5 h-5' />
          ) : (
            <ChevronLeft className='w-5 h-5' />
          )}
        </button>
      </div>

      {/* 메뉴 */}
      <ul className='flex-1 mt-2'>
        {MENU.map(({ href, label, icon: Icon, exact }) => {
          const target = itemPath(href);
          const active = isActive(href, exact);
          return (
            <li key={target}>
              <Link
                href={target}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "px-6"
                } py-3 transition-colors
                  ${
                    active
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
        {user ? (
          <button
            type='button'
            onClick={handleLogout}
            disabled={signingOut}
            className={`flex items-center justify-center w-full py-2 rounded hover:bg-gray-100
            ${signingOut ? "text-gray-400" : "text-red-600"}`}
          >
            {signingOut ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <LogOut className='w-4 h-4' />
            )}
            {!collapsed && (
              <span className='ml-2'>
                {signingOut ? "로그아웃 중..." : "로그아웃"}
              </span>
            )}
          </button>
        ) : (
          <button
            type='button'
            onClick={handleLogin}
            className='flex items-center justify-center w-full py-2 rounded hover:bg-gray-100 text-gray-800'
          >
            <LogIn className='w-4 h-4' />
            {!collapsed && <span className='ml-2'>로그인</span>}
          </button>
        )}
      </div>
    </nav>
  );
}

import React from "react";
import { Link } from "@/i18n/navigation";
import { Home, List, Package, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavKey = "home" | "clinics" | "package" | "mypage";

interface BottomNavProps {
  active: NavKey;
}

export default function BottomNav({ active }: BottomNavProps) {
  const items: {
    key: NavKey;
    href: string;
    Icon: LucideIcon;
    label: string;
  }[] = [
    { key: "home", href: "/", Icon: Home, label: "Home" },
    { key: "clinics", href: "/clinic", Icon: List, label: "Clinics" },
    { key: "package", href: "/package", Icon: Package, label: "Package" },
    { key: "mypage", href: "/mypage", Icon: User, label: "My page" },
  ];

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-2'>
      {items.map(({ key, href, Icon, label }) => {
        const isActive = key === active;
        const colorClass = isActive ? "text-primary" : "text-muted-foreground";
        return (
          <Link key={key} href={href} className='flex flex-col items-center'>
            <Icon className={`w-6 h-6 ${colorClass}`} />
            <span className={`text-xs ${colorClass}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

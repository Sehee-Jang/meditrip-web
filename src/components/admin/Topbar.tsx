"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { DatePicker } from "../ui/date-picker";

export default function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className='flex items-center justify-between bg-background px-6 py-3 border-b'>
      <DatePicker />
      <div className='flex items-center space-x-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleToggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
        </Button>
      </div>
    </header>
  );
}

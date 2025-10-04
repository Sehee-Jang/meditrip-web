"use client";

import * as React from "react";
import { useTheme } from "next-themes";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";

// --- Icons ---
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon";
import { SunIcon } from "@/components/tiptap-icons/sun-icon";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const initialThemeRef = React.useRef<string | null>(null);
  const initialResolvedThemeRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!initialThemeRef.current && theme) {
      initialThemeRef.current = theme;
    }
    if (!initialResolvedThemeRef.current && resolvedTheme) {
      initialResolvedThemeRef.current = resolvedTheme;
    }
  }, [theme, resolvedTheme]);

  React.useEffect(() => {
    return () => {
      const initialTheme = initialThemeRef.current;
      if (initialTheme) {
        setTheme(initialTheme);
      }
    };
  }, [setTheme]);

  const isDarkMode =
    (resolvedTheme ?? initialResolvedThemeRef.current ?? "light") === "dark";

  const toggleDarkMode = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      data-style='ghost'
    >
      {isDarkMode ? (
        <MoonStarIcon className='tiptap-button-icon' />
      ) : (
        <SunIcon className='tiptap-button-icon' />
      )}
    </Button>
  );
}

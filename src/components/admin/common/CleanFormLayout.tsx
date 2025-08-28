"use client";

import React from "react";
import useScrollSpy from "./useScrollSpy";

interface SectionItem {
  id: string;
  label: string;
}
interface CleanFormLayoutProps {
  sections: readonly SectionItem[];
  children: React.ReactNode;
}

export default function CleanFormLayout({
  sections,
  children,
}: CleanFormLayoutProps) {
  const activeId = useScrollSpy(sections.map((s) => s.id));

  return (
    <div className='grid lg:grid-cols-[220px_1fr] gap-8 min-h-[70vh]'>
      <aside className='hidden lg:block'>
        <nav className='sticky top-4'>
          <ul className='space-y-1'>
            {sections.map((s) => {
              const active = activeId === s.id;
              return (
                <li key={s.id}>
                  {/* 해시 사용 안 함: href="#" + data-target으로만 이동 */}
                  <a
                    href='#'
                    data-target={s.id}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector<HTMLElement>(`[data-section="${s.id}"]`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className={[
                      "block rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60",
                    ].join(" ")}
                  >
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className='relative'>
        <div className='space-y-10 pb-20'>{children}</div>
      </div>
    </div>
  );
}

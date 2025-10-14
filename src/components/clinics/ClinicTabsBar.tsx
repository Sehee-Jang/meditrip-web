"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";

type TabValue = "info" | "reviews";
interface Props {
  initialValue: TabValue;
  labels: { info: string; reviews: string };
}

export default function ClinicTabsBar({ initialValue, labels }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const makeHref = useMemo(() => {
    return (value: TabValue) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("tab", value);
      return `${pathname}?${sp.toString()}`;
    };
  }, [pathname, searchParams]);

  return (
    <div className='w-full border-b'>
      <Tabs
        defaultValue={initialValue}
        onValueChange={(v) => {
          const value: TabValue = v === "reviews" ? "reviews" : "info";
          router.push(makeHref(value), { scroll: false }); // 스크롤 유지
        }}
        className='w-full'
      >
        <TabsList
          className='
            grid w-full grid-cols-2
            bg-transparent p-0 rounded-none  /* 리스트 모서리/배경 제거 */
          '
        >
          {(["info", "reviews"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`
                relative inline-flex items-center justify-center
                h-9 px-0 py-0 text-sm font-medium
                rounded-none border-none bg-transparent shadow-none  /* 기본값 제거 */
                ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none /* 포커스 링/오프셋 제거 */
                transition-none text-muted-foreground

                /* shadcn 기본 활성 스타일 완전 무력화 */
                data-[state=active]:bg-transparent
                data-[state=active]:shadow-none

                data-[state=active]:text-[#E94F35]
                after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full
                after:bg-transparent
                data-[state=active]:after:bg-[#E94F35]
              `}
            >
              {tab === "info" ? labels.info : labels.reviews}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

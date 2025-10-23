"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Container from "../common/Container";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CategoryKey,
} from "@/constants/categories";
import clsx from "clsx";

const categoryKeys: CategoryKey[] = Object.keys(CATEGORIES) as CategoryKey[];

type Mode = "link" | "interactive";

type Props = {
  mode?: Mode;
  selectable?: boolean;
  multiple?: boolean;
  selected?: CategoryKey[];
  onChange?: (nextSelected: CategoryKey[]) => void;
  linkHref?: string;
  className?: string;
};

export default function CategorySection({
  mode = "interactive",
  selectable = false,
  multiple = false,
  selected = [],
  onChange,
  linkHref = "/clinics",
  className,
}: Props) {
  const t = useTranslations("categories");

  const handleClick = (key: CategoryKey) => {
    if (mode !== "interactive" || !selectable || !onChange) return;
    if (multiple) {
      const exists = selected.includes(key);
      const next = exists
        ? selected.filter((k) => k !== key)
        : [...selected, key];
      onChange(next);
    } else {
      const next = selected.includes(key) ? [] : [key];
      onChange(next);
    }
  };

  return (
    <section className='md:py-10'>
      <Container className={clsx("px-4 md:px-6", className)}>
        {/* 모바일: 줄바꿈되는 고정 그리드(쿠캣 스타일) / 데스크톱: 여유 5열 */}
        <div
          className={clsx(
            "grid gap-3 md:gap-6",
            // 모바일 그리드: 기기폭 차이를 흡수하기 위해 4열 기본, 390px 이상에선 5열
            "grid-cols-4 [@media(min-width:390px)]:grid-cols-5",
            // 데스크톱은 5열 유지
            "md:grid-cols-5"
          )}
          role={mode === "interactive" ? "listbox" : undefined}
          aria-multiselectable={mode === "interactive" ? multiple : undefined}
        >
          {categoryKeys.map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const isActive =
              mode === "interactive" && selectable && selected.includes(key);

            // 타일: 셀 중앙 정렬 + 고정 크기, 라벨은 아래에서 두 줄까지
            const tile =
              "flex h-14 w-14 items-center justify-center rounded-2xl " +
              "border border-border/60 bg-card shadow-sm transition-colors hover:bg-muted/80 " +
              "md:h-[88px] md:w-[88px]";
            const iconClass = !isActive ? "text-muted-foreground" : "";
            const label =
              // 두 줄 고정 영역(잘림 방지): 11px 폰트 + 14px 리딩 → 높이 28px
              "mt-1.5 text-center text-[11px] leading-[14px] text-foreground/80 " +
              "h-[28px] overflow-hidden break-keep " +
              "md:mt-3 md:text-sm md:leading-tight md:h-auto md:text-foreground";

            const inner = (
              <div className='flex flex-col items-center'>
                <div
                  className={clsx(
                    tile,
                    isActive &&
                      "bg-foreground text-background border-transparent"
                  )}
                >
                  <Icon size={22} className={iconClass} />
                </div>
                {/* 라벨 폭을 제한해 셀 너비를 넘지 않게 함 */}
                <span className={clsx(label, "max-w-[80px] md:max-w-none")}>
                  {t(key)}
                </span>
              </div>
            );

            if (mode === "link") {
              const href = `${linkHref}?categories=${encodeURIComponent(key)}`;
              return (
                <Link key={key} href={href} aria-label={t(key)}>
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={key}
                type='button'
                onClick={() => handleClick(key)}
                aria-pressed={isActive}
                aria-label={t(key)}
                role='option'
              >
                {inner}
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

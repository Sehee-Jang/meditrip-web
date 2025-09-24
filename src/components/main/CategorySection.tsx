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
  /** 링크 or 인터랙션 */
  mode?: Mode; // 기본 interactive

  /** 아래 4개는 mode==="interactive"일 때만 의미 */

  /** 선택 UI를 켤지 여부 */
  selectable?: boolean;
  /** 다중 선택 허용 여부 */
  multiple?: boolean;
  /** 선택된 카테고리들 */
  selected?: CategoryKey[];
  /** 선택 변경 콜백 */
  onChange?: (nextSelected: CategoryKey[]) => void;

  /** mode==="link"일 때 이동할 기본 경로 */
  linkHref?: string; // 기본 "/articles"

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
    <section className='md:y-10'>
      <Container className={clsx("px-0 md:px-6", className)}>
        <div className='grid grid-cols-5 gap-2 sm:gap-3 md:gap-4'>
          {categoryKeys.map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const isActive =
              mode === "interactive" && selectable && selected.includes(key);

            const classes = clsx(
              // 컨테이너: 카드 톤 + 테두리
              "h-[88px] rounded-md border border-border bg-card",
              // 레이아웃
              "flex flex-col items-center justify-center",
              // 인터랙션
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === "interactive" && selectable
                ? "hover:bg-accent hover:text-accent-foreground"
                : "hover:bg-muted/50",
              // 활성 상태 강조
              isActive && "ring-2 ring-ring"
            );
            const labelClasses = clsx(
              "text-xs font-medium",
              isActive ? "text-foreground" : "text-foreground/90"
            );

            const iconClasses = clsx(
              "mb-1",
              isActive ? "text-foreground" : "text-muted-foreground"
            );

            const inner = (
              <>
                <Icon size={24} className={iconClasses} />
                <span className={labelClasses}>{t(key)}</span>
              </>
            );

            if (mode === "link") {
              const href = `${linkHref}?categories=${encodeURIComponent(key)}`;
              return (
                <Link
                  key={key}
                  href={href}
                  className={classes}
                  aria-label={t(key)}
                >
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
                className={classes}
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

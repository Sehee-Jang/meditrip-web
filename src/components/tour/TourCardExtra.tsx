"use client";

import * as React from "react";
import { Phone, Clock, Car, Ticket } from "lucide-react";
import type { LucideProps } from "lucide-react";

type Props = {
  contentId: string;
  lang: "ko" | "en" | "ja" | "zh";
  fallbackPhone?: string;
};

type DetailResp = {
  phone?: string;
  introFields: Array<{ label: string; value: string }>;
  info: { extras: Array<{ name: string; text: string }> };
};

type IconComponent = React.ComponentType<LucideProps>;

function RowIcon({
  Icon,
  srLabel,
  children,
}: {
  Icon: IconComponent;
  srLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className='grid grid-cols-[24px,1fr] items-start gap-2 text-sm'>
      <div className='flex items-center justify-center text-muted-foreground'>
        <Icon className='h-4 w-4' aria-hidden />
        <span className='sr-only'>{srLabel}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* HTML → 텍스트(개행 유지, 엔티티 일부 디코드) */
function htmlToText(s = "") {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/* 텍스트를 줄 배열로 정규화: 트림, 빈 줄/… 제거 */
function toLines(s = ""): string[] {
  return htmlToText(s)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l !== "...");
}

function pickIntro(intros: DetailResp["introFields"], keys: string[]) {
  for (const k of keys) {
    const row = intros.find((r) => r.label === k);
    if (row?.value) return htmlToText(row.value);
  }
  return "";
}

function findExtra(
  extras: DetailResp["info"]["extras"],
  kinds: ("parkingFee" | "admission")[]
) {
  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  const out: Record<"parkingFee" | "admission", string> = {
    parkingFee: "",
    admission: "",
  };

  for (const ex of extras) {
    const name = norm(ex.name || "");
    const text = htmlToText(ex.text || "");
    if (!text) continue;

    if (kinds.includes("parkingFee")) {
      if (
        name.includes("주차요금") ||
        (name.includes("parking") && name.includes("fee"))
      ) {
        out.parkingFee ||= text;
      }
    }
    if (kinds.includes("admission")) {
      if (
        name.includes("입장료") ||
        name.includes("입장") ||
        name.includes("이용요금") ||
        name.includes("admission") ||
        name.includes("entrance")
      ) {
        out.admission ||= text;
      }
    }
  }
  return out;
}

/* 2줄 → 더보기/접기: 줄 수로 판단, 필요 없으면 버튼/그라데이션 미노출 */
function Expandable({
  text,
  lines = 2,
  more = "더보기",
  less = "접기",
}: {
  text: string;
  lines?: number;
  more?: string;
  less?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const normalizedLines = React.useMemo(() => toLines(text), [text]);
  const hasContent = normalizedLines.length > 0;
  const needToggle = normalizedLines.length > lines;

  if (!hasContent) return null;

  const visibleText = open
    ? normalizedLines.join("\n")
    : normalizedLines.slice(0, lines).join("\n");

  const clampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
  };

  return (
    <div className={open || !needToggle ? "relative" : "relative pr-12"}>
      <span
        className='block leading-relaxed'
        style={open || !needToggle ? { whiteSpace: "pre-wrap" } : clampStyle}
      >
        {visibleText}
      </span>

      {/* 접힘 상태에서만 페이드 */}
      {!open && needToggle && (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 bottom-0 h-6'
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0), var(--card) 70%)",
          }}
        />
      )}

      {/* 줄 수가 충분할 때만 토글 버튼 */}
      {needToggle && (
        <button
          type='button'
          onClick={() => setOpen((s) => !s)}
          className={
            open
              ? "mt-1 block w-full text-right text-xs underline text-muted-foreground"
              : "absolute bottom-0 right-0 rounded bg-background/80 px-1 text-xs underline text-muted-foreground"
          }
        >
          {open ? less : more}
        </button>
      )}
    </div>
  );
}

export default function TourCardExtra({
  contentId,
  lang,
  fallbackPhone,
}: Props) {
  const [detail, setDetail] = React.useState<DetailResp | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  /* 화면에 들어올 때만 상세 호출 */
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fetched = false;
    const ac = new AbortController();

    const io = new IntersectionObserver(
      (entries) => {
        if (fetched) return;
        if (entries.some((e) => e.isIntersecting)) {
          fetched = true;
          fetch(`/api/kto/wellness/${contentId}/detail?lang=${lang}`, {
            cache: "no-store",
            signal: ac.signal,
          })
            .then((r) => r.json())
            .then((json: DetailResp) => setDetail(json))
            .catch(() => {});
        }
      },
      { rootMargin: "200px" }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      ac.abort();
    };
  }, [contentId, lang]);

  const t = (ko: string, en: string) => (lang === "ko" ? ko : en);

  const phone =
    detail?.phone?.trim() ||
    (detail ? pickIntro(detail.introFields, ["문의", "Infocenter"]) : "") ||
    fallbackPhone ||
    "";

  const hours = detail
    ? pickIntro(detail.introFields, ["이용시간", "운영시간", "Operating hours"])
    : "";

  const parking = detail
    ? pickIntro(detail.introFields, ["주차", "Parking"])
    : "";

  const { parkingFee, admission } = detail
    ? findExtra(detail.info.extras, ["parkingFee", "admission"])
    : { parkingFee: "", admission: "" };

  const hasAny =
    Boolean(phone) ||
    toLines(hours).length > 0 ||
    Boolean(parking || parkingFee) ||
    toLines(admission).length > 0;

  if (!hasAny) {
    return <div ref={ref} className='mt-3 border-t pt-3 text-sm' />;
  }

  return (
    <div ref={ref} className='mt-3 space-y-1.5 border-t pt-3'>
      {phone && (
        <RowIcon Icon={Phone} srLabel={t("연락처", "Contact")}>
          <span>{phone}</span>
        </RowIcon>
      )}

      {toLines(hours).length > 0 && (
        <RowIcon Icon={Clock} srLabel={t("운영시간", "Hours")}>
          <Expandable
            text={hours}
            lines={1} // 1줄까지는 더보기 없음
            more={t("더보기", "More")}
            less={t("접기", "Less")}
          />
        </RowIcon>
      )}

      {(parking || parkingFee) && (
        <RowIcon Icon={Car} srLabel={t("주차", "Parking")}>
          <span>{parking || t("정보 없음", "N/A")}</span>
          {parkingFee && (
            <span className='ml-2 text-muted-foreground'>
              ({t("주차요금", "Fee")} {parkingFee})
            </span>
          )}
        </RowIcon>
      )}

      {toLines(admission).length > 0 && (
        <RowIcon Icon={Ticket} srLabel={t("입장료", "Admission")}>
          <Expandable
            text={admission}
            lines={2} // 2줄까지는 더보기 없음
            more={t("더보기", "More")}
            less={t("접기", "Less")}
          />
        </RowIcon>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Calendar as CalendarIcon,
  Filter,
  Heart,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  Undo2,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

import SectionCard from "@/components/admin/common/SectionCard";
import { auth } from "@/lib/firebase";
import type { ClinicStatus } from "@/types/clinic";
import type { CategoryKey } from "@/constants/categories";
import { CATEGORY_LABELS_KO, CATEGORY_KEYS } from "@/constants/categories";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------- 포맷터 ---------- */
const integerFormatter = new Intl.NumberFormat("ko-KR");
const decimalFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/* ---------- 타입 ---------- */
type RangePreset = "today" | "7d" | "30d" | "custom";
type SortField = "additions" | "cancellations" | "net" | "name" | "category";
type SortOrder = "asc" | "desc";
type ComparisonMode = "percent" | "absolute";

interface TrendPoint {
  date: string;
  additions: number;
  cancellations: number;
  net: number;
}
interface ClinicRow {
  clinicId: string;
  name: string;
  address?: string;
  status?: ClinicStatus;
  categoryKeys: CategoryKey[];
  additions: number;
  cancellations: number;
  net: number;
  share: number;
  userCount: number;
  dailySeries: TrendPoint[];
}
interface LatestFavoriteRow {
  clinicId: string;
  clinicName: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  occurredAt: Date | null;
}
interface DeltaSummary {
  current: number;
  previous: number;
  absolute: number;
  percent: number | null;
}
interface WishlistStats {
  period: {
    preset: RangePreset;
    start: Date;
    end: Date;
    compareToPrevious: boolean;
  };
  totals: {
    totalActions: number;
    additions: number;
    cancellations: number;
    netChange: number;
    uniqueUsers: number;
    uniqueClinics: number;
    averageFavoritesPerUser: number;
  };
  comparison?: {
    totalActions: DeltaSummary;
    additions: DeltaSummary;
    cancellations: DeltaSummary;
    netChange: DeltaSummary;
  };
  trend: TrendPoint[];
  clinics: ClinicRow[];
  latestFavorites: LatestFavoriteRow[];
  lastUpdated: Date;
}
interface WishlistStatsResponse
  extends Omit<WishlistStats, "period" | "latestFavorites" | "lastUpdated"> {
  period: WishlistStats["period"] & { start: string; end: string };
  clinics: Array<
    Omit<ClinicRow, "dailySeries"> & { dailySeries: TrendPoint[] }
  >;
  latestFavorites: Array<
    Omit<LatestFavoriteRow, "occurredAt"> & { occurredAt: string | null }
  >;
  lastUpdated: string;
}

/* ---------- 상수 ---------- */
const PRESET_OPTIONS: Array<{ value: RangePreset; label: string }> = [
  { value: "today", label: "오늘" },
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "custom", label: "사용자 지정" },
];
const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: "additions", label: "신규 찜 수" },
  { value: "cancellations", label: "취소 수" },
  { value: "net", label: "순증" },
  { value: "name", label: "클리닉명" },
  { value: "category", label: "카테고리" },
];
const LIMIT_OPTIONS = [5, 10, 20, 50];

/* ---------- 유틸 ---------- */
function formatFavoriteUserLabel(f: LatestFavoriteRow): string {
  const hasProfile = Boolean(f.userName || f.userEmail);
  if (hasProfile) {
    const name = f.userName ?? "이름 정보 없음";
    const email = f.userEmail ?? "이메일 정보 없음";
    return `사용자: ${name} · ${email}`;
  }
  return `사용자 ID: ${f.userId}`;
}
function formatDateLabel(value: string): string {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  return format(parsed, "MM.dd");
}

function formatTooltipDate(value: string): string {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  return format(parsed, "yyyy.MM.dd");
}

function renderDelta(
  delta: DeltaSummary | undefined,
  mode: ComparisonMode,
  direction: "up" | "down" = "up"
) {
  if (!delta) return null;
  const value = mode === "percent" ? delta.percent ?? null : delta.absolute;
  if (value === null) {
    return (
      <span className='text-xs text-muted-foreground'>전 기간 데이터 없음</span>
    );
  }
  if (value === 0) {
    return <span className='text-xs text-muted-foreground'>변동 없음</span>;
  }
  const isIncrease = value > 0;
  const isPositive = direction === "up" ? isIncrease : !isIncrease;
  const Icon = isIncrease ? ArrowUpRight : ArrowDownRight;
  const formatted =
    mode === "percent"
      ? `${isIncrease ? "+" : ""}${percentFormatter.format(value)}%`
      : `${isIncrease ? "+" : ""}${integerFormatter.format(value)}`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isPositive
          ? "bg-emerald-100/70 text-emerald-700"
          : "bg-destructive/10 text-destructive"
      )}
    >
      <Icon className='h-3.5 w-3.5' aria-hidden />
      {formatted}
    </span>
  );
}

/* ---------- KPI 카드 (토스풍) ---------- */
function KPICard(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  value: number;
  suffix: string;
  delta?: DeltaSummary;
  showDelta?: boolean;
  direction?: "up" | "down";
}) {
  const {
    icon: Icon,
    label,
    description,
    value,
    suffix,
    delta,
    showDelta,
    direction,
  } = props;
  return (
    <div className='rounded-xl border border-border/70 bg-background p-4 shadow-none transition-colors hover:bg-muted/30 text-left'>
      <div className='grid grid-cols-[1fr_auto] items-start gap-3'>
        <div className='min-w-0 text-left'>
          <p className='text-[11px] tracking-wide text-muted-foreground'>
            {description}
          </p>
          <h3 className='mt-0.5 text-sm font-medium text-foreground'>
            {label}
          </h3>
        </div>
        <span
          className='grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground'
          aria-hidden
        >
          <Icon className='h-4 w-4' />
        </span>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <p className='text-[28px] font-semibold leading-none tracking-tight text-foreground tabular-nums'>
          {integerFormatter.format(value)}
          <span className='ml-1 text-sm text-muted-foreground'>{suffix}</span>
        </p>
        {showDelta ? renderDelta(delta, "percent", direction) : null}
      </div>
    </div>
  );
}

/* ---------- 듀얼 라인차트(신규/취소) ---------- */
function WishlistTrendChart({ data }: { data: TrendPoint[] }) {
  const gradId = React.useId();
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  
  if (!data.length) {
    return (
      <div className='flex h-[220px] items-center justify-center text-sm text-muted-foreground'>
        집계할 데이터가 없습니다.
      </div>
    );
  }

  const width = 640;
  const height = 200;
  const pad = { top: 10, right: 10, bottom: 30, left: 36 };

  const maxY = Math.max(
    ...data.map((d) => Math.max(d.additions, d.cancellations)),
    1
  );
  const xCount = Math.max(data.length - 1, 1);

  const x = (i: number) =>
    pad.left + (i / xCount) * (width - pad.left - pad.right);
  const y = (v: number) =>
    pad.top + (1 - v / (maxY || 1)) * (height - pad.top - pad.bottom);

  const ptsA = data.map((d, i) => ({ x: x(i), y: y(d.additions) }));
  const ptsC = data.map((d, i) => ({ x: x(i), y: y(d.cancellations) }));

  const toPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length <= 1) return `M ${pts[0]?.x ?? 0},${pts[0]?.y ?? 0}`;
    const s = 0.18;
    const out: string[] = [`M ${pts[0].x},${pts[0].y}`];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? pts[i + 1];
      out.push(
        `C ${p1.x + (p2.x - p0.x) * s},${p1.y + (p2.y - p0.y) * s} ${
          p2.x - (p3.x - p1.x) * s
        },${p2.y - (p3.y - p1.y) * s} ${p2.x},${p2.y}`
      );
    }
    return out.join(" ");
  };

  // 가이드선 3개
  const guides = [0, 0.5, 1].map((t) => y(maxY * t));
  // x축 라벨(좌/중/우)
  const xLabels =
    data.length <= 3
      ? data.map((d, i) => ({ i, label: formatDateLabel(d.date) }))
      : [0, Math.round((data.length - 1) / 2), data.length - 1].map((i) => ({
          i,
          label: formatDateLabel(data[i].date),
        }));

  const chartWidth = width - pad.left - pad.right;

  const handlePointerMove = (
    event: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    const native = event.nativeEvent;
    let clientX: number | null = null;
    if ("touches" in native) {
      const touch = native.touches[0] ?? native.changedTouches[0];
      clientX = touch?.clientX ?? null;
    } else if ("clientX" in native) {
      clientX = native.clientX;
    }
    if (clientX === null) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * width;
    const ratio = (relX - pad.left) / (chartWidth || 1);
    const nextIndex = Math.round(ratio * xCount);
    const clamped = Math.max(0, Math.min(data.length - 1, nextIndex));
    setHoverIndex(clamped);
  };

  const handlePointerLeave = () => setHoverIndex(null);

  const activeIndex = hoverIndex ?? null;
  const activePoint = activeIndex !== null ? data[activeIndex] ?? null : null;
  const tooltipX =
    activeIndex !== null ? x(activeIndex) : (pad.left + width - pad.right) / 2;
  const tooltipAdditionY =
    activeIndex !== null ? y(activePoint?.additions ?? 0) : 0;
  const tooltipCancellationY =
    activeIndex !== null ? y(activePoint?.cancellations ?? 0) : 0;
  const tooltipTop = Math.min(tooltipAdditionY, tooltipCancellationY);

  return (
    <div className='flex flex-col gap-2'>
      <div className='text-xs text-muted-foreground'>기간 내 일자별 추이</div>

      <div className='relative'>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className='h-[240px] w-full touch-none'
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handlePointerMove}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerLeave}
        >
          <defs>
            <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='rgb(99 102 241 / 0.14)' />
              <stop offset='100%' stopColor='rgb(99 102 241 / 0)' />
            </linearGradient>
          </defs>

          {guides.map((gy, i) => (
            <line
              key={i}
              x1={pad.left}
              x2={width - pad.right}
              y1={gy}
              y2={gy}
              stroke='currentColor'
              className='text-muted-foreground/20'
              strokeWidth={1}
              shapeRendering='crispEdges'
            />
          ))}

          {/* 면적(신규) */}
          <path
            d={`${toPath(ptsA)} L ${ptsA.at(-1)?.x ?? 0},${y(0)} L ${
              ptsA[0]?.x ?? 0
            },${y(0)} Z`}
            fill={`url(#${gradId})`}
          />

          {/* 신규 라인 */}
          <path
            d={toPath(ptsA)}
            fill='none'
            stroke='rgb(99 102 241)'
            strokeWidth={1.8}
          />

          {/* 취소 라인(점선) */}
          <path
            d={toPath(ptsC)}
            fill='none'
            stroke='rgb(239 68 68)'
            strokeWidth={1.6}
            strokeDasharray='3 3'
          />

          {activePoint ? (
            <g className='pointer-events-none'>
              <line
                x1={tooltipX}
                x2={tooltipX}
                y1={pad.top}
                y2={height - pad.bottom}
                stroke='currentColor'
                className='text-muted-foreground/40'
                strokeWidth={1}
                strokeDasharray='4 4'
              />
              <circle
                cx={tooltipX}
                cy={y(activePoint.additions)}
                r={4}
                fill='rgb(99 102 241)'
                stroke='white'
                strokeWidth={1.5}
              />
              <circle
                cx={tooltipX}
                cy={y(activePoint.cancellations)}
                r={4}
                fill='rgb(239 68 68)'
                stroke='white'
                strokeWidth={1.5}
              />
            </g>
          ) : null}
        </svg>

        {activePoint ? (
          <div
            className='pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur'
            style={{
              left: `${((tooltipX / width) * 100).toFixed(3)}%`,
              top: `${Math.max(tooltipTop - 12, pad.top).toFixed(2)}px`,
            }}
          >
            <div className='text-[11px] font-medium text-muted-foreground'>
              {formatTooltipDate(activePoint.date)}
            </div>
            <div className='mt-1 flex items-center gap-2 font-medium text-foreground'>
              <span className='flex items-center gap-1'>
                <span className='h-2 w-2 rounded-full bg-primary' />
                신규: {integerFormatter.format(activePoint.additions)}건
              </span>
              <span className='flex items-center gap-1 text-destructive'>
                <span className='h-2 w-2 rounded-full bg-destructive' />
                취소: {integerFormatter.format(activePoint.cancellations)}건
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* x축 라벨 */}
      <div className='relative mt-1 h-5'>
        {xLabels.map(({ i, label }) => (
          <span
            key={i}
            className='absolute -translate-x-1/2 text-[11px] text-muted-foreground'
            style={{ left: `${((x(i) / width) * 100).toFixed(3)}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* 범례 */}
      <div className='mt-2 flex items-center gap-4 text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <span className='h-2 w-2 rounded-full bg-primary' />
          신규
        </span>
        <span className='flex items-center gap-1'>
          <span className='h-2 w-2 rounded-full bg-destructive' />
          취소
        </span>
      </div>
    </div>
  );
}

/* ---------- 메인 ---------- */
export default function WishlistStatistics() {
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [rangePreset, setRangePreset] = useState<RangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [compareToPrevious, setCompareToPrevious] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] =
    useState<ComparisonMode>("percent");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CategoryKey>(
    "all"
  );
  const [sortField, setSortField] = useState<SortField>("additions");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState<number>(10);

  /* 검색 디바운스 */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const shouldFetch =
    rangePreset !== "custom" || (customRange?.from && customRange?.to);

  /* 데이터 로드 (기능 동일) */
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function ensureUser(): Promise<User | null> {
      if (auth.currentUser) return auth.currentUser;
      return new Promise<User | null>((resolve) => {
        const unsub = auth.onAuthStateChanged((next) => {
          unsub();
          resolve(next);
        });
      });
    }

    async function loadWishlistStats() {
      if (!shouldFetch) {
        if (active) {
          setStats(null);
          setLoading(false);
        }
        return;
      }
      try {
        if (active) {
          setLoading(true);
          setError(null);
        }
        const user = await ensureUser();
        if (!user)
          throw new Error("관리자 인증 정보가 없습니다. 다시 로그인해 주세요.");

        const idToken = await user.getIdToken();
        const params = new URLSearchParams();
        params.set("range", rangePreset);
        if (rangePreset === "custom" && customRange?.from && customRange?.to) {
          const start = new Date(customRange.from);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customRange.to);
          end.setHours(23, 59, 59, 999);
          params.set("start", start.toISOString());
          params.set("end", end.toISOString());
        }
        if (compareToPrevious) params.set("compare", "true");
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        params.set("sort", sortField);
        params.set("order", sortOrder);
        params.set("limit", String(limit));

        const res = await fetch(
          `/api/admin/wishlist/stats?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
            signal: controller.signal,
          }
        );

        const raw = await res.text();
        if (!res.ok) {
          let msg = "찜하기 통계를 불러오지 못했습니다.";
          try {
            const payload = JSON.parse(raw) as { error?: string };
            if (payload.error) msg = payload.error;
          } catch {}
          throw new Error(msg);
        }

        const payload = JSON.parse(raw) as WishlistStatsResponse;
        if (!active) return;

        const parsed: WishlistStats = {
          ...payload,
          period: {
            ...payload.period,
            start: new Date(payload.period.start),
            end: new Date(payload.period.end),
          },
          clinics: payload.clinics.map((c) => ({ ...c })),
          latestFavorites: payload.latestFavorites.map((f) => ({
            ...f,
            occurredAt: f.occurredAt ? new Date(f.occurredAt) : null,
          })),
          lastUpdated: new Date(payload.lastUpdated),
        };

        setStats(parsed);
      } catch (e) {
        if (!active) return;
        console.error(e);
        setError(
          e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다."
        );
        setStats(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWishlistStats();
    return () => {
      active = false;
      controller.abort();
    };
  }, [
    rangePreset,
    customRange?.from,
    customRange?.to,
    compareToPrevious,
    debouncedSearch,
    categoryFilter,
    sortField,
    sortOrder,
    limit,
    shouldFetch,
  ]);

  /* KPI 데이터 */
  const summaryCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: "totalActions",
        label: "총 찜 수",
        description: "선택 기간 전체",
        value: stats.totals.totalActions,
        suffix: "건",
        icon: Heart,
        delta: stats.comparison?.totalActions,
        direction: "up" as const,
      },
      {
        key: "additions",
        label: "신규 찜 수",
        description: "해당 기간",
        value: stats.totals.additions,
        suffix: "건",
        icon: Sparkles,
        delta: stats.comparison?.additions,
        direction: "up" as const,
      },
      {
        key: "cancellations",
        label: "취소 수",
        description: "해당 기간",
        value: stats.totals.cancellations,
        suffix: "건",
        icon: Undo2,
        delta: stats.comparison?.cancellations,
        direction: "down" as const,
      },
      {
        key: "netChange",
        label: "순증",
        description: "신규 - 취소",
        value: stats.totals.netChange,
        suffix: "건",
        icon: TrendingUp,
        delta: stats.comparison?.netChange,
        direction: "up" as const,
      },
    ];
  }, [stats]);

  const periodLabel = stats
    ? `${format(stats.period.start, "yyyy.MM.dd")} ~ ${format(
        stats.period.end,
        "yyyy.MM.dd"
      )}`
    : null;

  const readyForCustom =
    rangePreset === "custom" && (!customRange?.from || !customRange?.to);

  /* ---------- UI ---------- */
  return (
    <section className='space-y-8'>
      {/* 컨트롤바: 토스풍(라이트, 라운드, 낮은 대비) */}
      <div className='rounded-2xl border border-border/70 bg-background p-4 shadow-none'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* 날짜 프리셋 버튼들 */}
          <div className='flex flex-wrap items-center gap-2'>
            {PRESET_OPTIONS.map((preset) => {
              const active = rangePreset === preset.value;
              return (
                <Button
                  key={preset.value}
                  type='button'
                  size='sm'
                  variant='chip'
                  aria-pressed={active}
                  data-pressed={active}
                  className='rounded-full px-3 transition-colors'
                  onClick={() => {
                    setRangePreset(preset.value);
                    if (preset.value !== "custom") setCustomRange(undefined);
                  }}
                >
                  {preset.label}
                </Button>
              );
            })}

            {rangePreset === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='chip'
                    data-pressed
                    className='rounded-full px-3 flex items-center gap-2'
                  >
                    <CalendarIcon className='h-4 w-4' />
                    {customRange?.from && customRange?.to
                      ? `${format(customRange.from, "yyyy.MM.dd")} ~ ${format(
                          customRange.to,
                          "yyyy.MM.dd"
                        )}`
                      : "기간 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    initialFocus
                    mode='range'
                    numberOfMonths={2}
                    selected={customRange}
                    onSelect={(range) => setCustomRange(range)}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Filter className='h-4 w-4' />
              <span>전 기간 비교</span>
              <Switch
                checked={compareToPrevious}
                onCheckedChange={(n) => setCompareToPrevious(Boolean(n))}
              />
            </div>

            {compareToPrevious && (
              <div className='flex items-center gap-1 rounded-full border border-border/70 p-0.5'>
                <Button
                  type='button'
                  size='sm'
                  variant={comparisonMode === "percent" ? "default" : "ghost"}
                  className='rounded-full px-3'
                  onClick={() => setComparisonMode("percent")}
                >
                  증감률
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant={comparisonMode === "absolute" ? "default" : "ghost"}
                  className='rounded-full px-3'
                  onClick={() => setComparisonMode("absolute")}
                >
                  차이값
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='클리닉명 또는 ID 검색'
              className='border-none bg-transparent shadow-none focus-visible:ring-0'
            />
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Select
              value={categoryFilter}
              onValueChange={(next) =>
                setCategoryFilter(next as "all" | CategoryKey)
              }
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='카테고리' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체 카테고리</SelectItem>
                {CATEGORY_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATEGORY_LABELS_KO[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(next) => setSortField(next as SortField)}
            >
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='정렬 기준' />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(next) => setSortOrder(next as SortOrder)}
            >
              <SelectTrigger className='w-[110px]'>
                <SelectValue placeholder='정렬 방향' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='desc'>내림차순</SelectItem>
                <SelectItem value='asc'>오름차순</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(limit)}
              onValueChange={(next) => setLimit(Number.parseInt(next, 10))}
            >
              <SelectTrigger className='w-[100px]'>
                <SelectValue placeholder='표시 개수' />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Top {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 에러/로딩 */}
      {error ? (
        <div className='rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='h-5 w-5 flex-shrink-0' />
            <div>
              <p className='font-semibold'>
                찜하기 통계를 불러오지 못했습니다.
              </p>
              <p className='mt-1 text-xs opacity-80'>{error}</p>
            </div>
          </div>
        </div>
      ) : readyForCustom ? (
        <div className='rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground'>
          사용자 지정 기간을 선택하면 해당 기간의 찜하기 통계를 확인할 수
          있습니다.
        </div>
      ) : loading || !stats ? (
        <div className='space-y-6'>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='h-28 rounded-2xl border bg-muted/30 animate-pulse'
              />
            ))}
          </div>
          <div className='rounded-2xl border bg-background p-10 text-center text-sm text-muted-foreground'>
            <div className='flex items-center justify-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              찜하기 통계를 불러오는 중입니다...
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {summaryCards.map((card) => (
              <KPICard
                key={card.key}
                icon={card.icon}
                label={card.label}
                description={card.description}
                value={card.value}
                suffix={card.suffix}
                delta={card.delta}
                direction={card.direction}
                showDelta={stats.period.compareToPrevious}
              />
            ))}
          </div>

          {/* 정보 바 */}
          <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <BarChart2 className='h-4 w-4' />
              <span>선택한 기간: {periodLabel}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span>
                찜 사용자 수:{" "}
                {integerFormatter.format(stats.totals.uniqueUsers)}명
              </span>
              <span className='hidden sm:inline-block'>·</span>
              <span>
                평균 1인 찜 수:{" "}
                {decimalFormatter.format(stats.totals.averageFavoritesPerUser)}
                건
              </span>
            </div>
          </div>

          {/* 추세 */}
          <SectionCard
            title='찜하기 추세'
            description='선택한 기간 동안 일자별 신규/취소 추이를 확인할 수 있습니다.'
          >
            <div className='p-5'>
              <WishlistTrendChart data={stats.trend} />
            </div>
          </SectionCard>

          {/* TOP 리스트 (테이블은 유지, 톤/여백만 조정) */}
          <SectionCard
            title='클리닉 TOP 순위'
            description='선택한 기간 내 가장 많이 찜된 클리닉을 정렬/검색할 수 있습니다.'
          >
            <div className='p-5 space-y-4'>
              {stats.clinics.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  조건에 맞는 클리닉 데이터가 없습니다.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12 text-center'>#</TableHead>
                      <TableHead>클리닉</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead className='text-right'>신규</TableHead>
                      <TableHead className='text-right'>취소</TableHead>
                      <TableHead className='text-right'>순증</TableHead>
                      <TableHead className='text-right'>점유율</TableHead>
                      <TableHead className='text-right'>찜 사용자</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.clinics.map((clinic, index) => {
                      const primaryCategory = clinic.categoryKeys[0];
                      return (
                        <React.Fragment key={clinic.clinicId}>
                          <TableRow className='hover:bg-muted/30'>
                            <TableCell className='text-center font-semibold text-muted-foreground'>
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-col gap-1 text-left'>
                                <span className='font-medium text-foreground'>
                                  {clinic.name}
                                </span>
                                <span className='text-[11px] text-muted-foreground'>
                                  {clinic.address ?? "주소 정보 없음"}
                                </span>
                                {clinic.status === "hidden" && (
                                  <Badge
                                    variant='secondary'
                                    className='w-fit bg-amber-100 text-amber-700 hover:bg-amber-100'
                                  >
                                    비노출
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {primaryCategory
                                ? CATEGORY_LABELS_KO[primaryCategory]
                                : "카테고리 없음"}
                            </TableCell>
                            <TableCell className='text-right font-medium tabular-nums'>
                              {integerFormatter.format(clinic.additions)}
                            </TableCell>
                            <TableCell className='text-right text-destructive tabular-nums'>
                              {integerFormatter.format(clinic.cancellations)}
                            </TableCell>
                            <TableCell className='text-right font-medium tabular-nums'>
                              {integerFormatter.format(clinic.net)}
                            </TableCell>
                            <TableCell className='text-right text-muted-foreground tabular-nums'>
                              {decimalFormatter.format(clinic.share)}%
                            </TableCell>
                            <TableCell className='text-right text-muted-foreground tabular-nums'>
                              {integerFormatter.format(clinic.userCount)}명
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </SectionCard>

          {/* 최근 내역 (좌측 정렬 + 균형 여백) */}
          <SectionCard
            title='최근 찜한 내역'
            description='선택한 기간의 최신 찜 데이터를 사용자 정보와 함께 확인할 수 있습니다.'
          >
            <div className='p-5'>
              {stats.latestFavorites.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  해당 기간에 등록된 찜 데이터가 없습니다.
                </p>
              ) : (
                <ul className='divide-y divide-border/60 rounded-xl border'>
                  {stats.latestFavorites.map((f) => (
                    <li
                      key={`${f.userId}-${f.clinicId}-${
                        f.occurredAt?.getTime() ?? "unknown"
                      }`}
                      className='grid grid-cols-[1fr_auto] items-stretch gap-4 px-6 py-4'
                    >
                      <div className='min-w-0 grid content-between gap-1 text-left'>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          {f.clinicName}
                        </p>
                        <p className='truncate self-end text-[11px] leading-[1.15] text-muted-foreground'>
                          {formatFavoriteUserLabel(f)}
                        </p>
                      </div>
                      <div className='w-[96px] justify-self-end self-start text-right text-[11px] leading-[1.15] text-muted-foreground tabular-nums'>
                        {f.occurredAt
                          ? dateTimeFormatter.format(f.occurredAt)
                          : "시간 정보 없음"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          <p className='text-[11px] text-muted-foreground'>
            마지막 업데이트: {dateTimeFormatter.format(stats.lastUpdated)}
          </p>
        </>
      )}
    </section>
  );
}

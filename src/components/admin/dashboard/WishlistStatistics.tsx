"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  AlertCircle,
  Heart,
  Layers,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

import SectionCard from "@/components/admin/common/SectionCard";
import { auth } from "@/lib/firebase";
import type { ClinicStatus } from "@/types/clinic";

/* 숫자 포맷터 */
const integerFormatter = new Intl.NumberFormat("ko-KR");
const decimalFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/* ----- 타입 ----- */
interface WeeklyPoint {
  label: string;
  count: number;
}

interface TopClinicRow {
  clinicId: string;
  name: string;
  address?: string;
  status?: ClinicStatus;
  totalFavorites: number;
  share: number;
}

interface LatestFavoriteRow {
  clinicId: string;
  clinicName: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  createdAt: Date | null;
}

interface WishlistStats {
  totalFavorites: number;
  newFavorites7d: number;
  uniqueUsers: number;
  averageFavoritesPerUser: number;
  weeklySeries: WeeklyPoint[];
  topClinics: TopClinicRow[];
  latestFavorites: LatestFavoriteRow[];
  lastUpdated: Date;
}

interface WishlistTrendChartProps {
  data: WeeklyPoint[];
}

interface WishlistStatsResponse
  extends Omit<WishlistStats, "latestFavorites" | "lastUpdated"> {
  lastUpdated: string;
  latestFavorites: Array<
    Omit<LatestFavoriteRow, "createdAt"> & { createdAt: string | null }
  >;
}

/* ----- 유틸 ----- */
function formatFavoriteUserLabel(favorite: LatestFavoriteRow): string {
  const hasProfile = Boolean(favorite.userName || favorite.userEmail);
  if (hasProfile) {
    const name = favorite.userName ?? "이름 정보 없음";
    const email = favorite.userEmail ?? "이메일 정보 없음";
    return `사용자: ${name} · ${email}`;
  }
  return `사용자 ID: ${favorite.userId}`;
}

/* ----- KPI 카드 (상단 4개) ----- */
function KPICard(props: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  value: number;
  suffix: string;
  formatter: Intl.NumberFormat;
}) {
  const { icon: Icon, label, description, value, suffix, formatter } = props;
  return (
    <div
      className='
        rounded-xl border border-border/70 bg-background
        p-4 shadow-none transition-colors hover:bg-muted/30
        text-left
      '
    >
      {/* 상단: 텍스트 영역(왼쪽) + 아이콘(오른쪽) */}
      <div className='grid grid-cols-[1fr_auto] items-start gap-3'>
        <div className='min-w-0 text-left'>
          <p className='text-[11px] tracking-wide text-muted-foreground text-left'>
            {description}
          </p>
          <h3 className='mt-0.5 text-sm font-medium text-foreground text-left'>
            {label}
          </h3>
        </div>

        <span
          className='
            grid h-8 w-8 place-items-center rounded-full
            border border-border/60 text-muted-foreground
          '
          aria-hidden
        >
          <Icon className='h-4 w-4' />
        </span>
      </div>

      {/* 값도 좌측 기준 유지 */}
      <p
        className='
          mt-4 text-[28px] font-semibold text-foreground tabular-nums
          leading-none tracking-tight text-left
        '
      >
        {formatter.format(value)}
        <span className='ml-1 text-sm text-muted-foreground'>{suffix}</span>
      </p>
    </div>
  );
}

/* ----- 라인차트 ----- */
function WishlistTrendChart({ data }: WishlistTrendChartProps) {
  // 항상 최상단에서 Hook 호출
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const gradId = React.useId();

  // 빈 데이터 처리는 Hook 호출 이후에
  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        집계할 데이터가 없습니다.
      </div>
    );
  }

  const width = 640;
  const height = 200;
  const pad = { top: 8, right: 8, bottom: 28, left: 36 };

  const maxY = Math.max(...data.map((d) => d.count), 1);
  const minY = 0;
  const xCount = Math.max(data.length - 1, 1);

  const x = (i: number) =>
    pad.left + (i / xCount) * (width - pad.left - pad.right);
  const y = (v: number) => {
    const innerH = height - pad.top - pad.bottom;
    const t = (v - minY) / (maxY - minY || 1);
    return pad.top + (1 - t) * innerH;
  };

  const pts = data.map((d, i) => ({ x: x(i), y: y(d.count) }));

  const toPathD = (p: Array<{ x: number; y: number }>): string => {
    if (p.length <= 1) return `M ${p[0]?.x ?? 0},${p[0]?.y ?? 0}`;
    const s = 0.18;
    const out: string[] = [`M ${p[0].x},${p[0].y}`];
    for (let i = 0; i < p.length - 1; i += 1) {
      const p0 = p[i - 1] ?? p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] ?? p[i + 1];
      out.push(
        `C ${p1.x + (p2.x - p0.x) * s},${p1.y + (p2.y - p0.y) * s} ${
          p2.x - (p3.x - p1.x) * s
        },${p2.y - (p3.y - p1.y) * s} ${p2.x},${p2.y}`
      );
    }
    return out.join(" ");
  };

  // 수평 가이드 3개만
  const gridYs = [0, 0.5, 1].map((t) => y(minY + (maxY - minY) * t));

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < data.length; i += 1) {
      const d = Math.abs(px - x(i));
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    setHoverIdx(best);
  };
  const onLeave = () => setHoverIdx(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-muted-foreground">최근 8주간 주간 추이</div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(99 102 241 / 0.12)" />
              <stop offset="100%" stopColor="rgb(99 102 241 / 0)" />
            </linearGradient>
          </defs>

          {gridYs.map((gy, i) => (
            <line
              key={i}
              x1={pad.left}
              x2={width - pad.right}
              y1={gy}
              y2={gy}
              stroke="currentColor"
              className="text-muted-foreground/20"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          ))}

          {/* 면적 */}
          <path
            d={`${toPathD(pts)} L ${pts.at(-1)?.x ?? 0},${y(0)} L ${
              pts[0]?.x ?? 0
            },${y(0)} Z`}
            fill={`url(#${gradId})`}
          />

          {/* 라인 */}
          <path
            d={toPathD(pts)}
            fill="none"
            stroke="rgb(99 102 241)"
            strokeWidth={1.75}
            strokeLinecap="round"
          />

          {/* 인터랙션 */}
          <rect
            x={pad.left}
            y={pad.top}
            width={width - pad.left - pad.right}
            height={height - pad.top - pad.bottom}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          />

          {/* 호버 가이드 + 점 */}
          {hoverIdx !== null && (
            <>
              <line
                x1={x(hoverIdx)}
                x2={x(hoverIdx)}
                y1={pad.top}
                y2={height - pad.bottom}
                stroke="currentColor"
                className="text-muted-foreground/35"
                strokeDasharray="3 3"
              />
              <circle
                cx={x(hoverIdx)}
                cy={y(data[hoverIdx].count)}
                r={3.5}
                fill="rgb(99 102 241)"
              />
            </>
          )}
        </svg>

        {/* 툴팁 */}
        {hoverIdx !== null && (
          <div
            className="
              pointer-events-none absolute -translate-x-1/2 -translate-y-2
              rounded-full border border-border/70 bg-background/95
              px-2.5 py-1 text-[11px] shadow-sm
            "
            style={{
              left: `${((x(hoverIdx) / width) * 100).toFixed(3)}%`,
              top: `${((y(data[hoverIdx].count) / height) * 100).toFixed(3)}%`,
            }}
          >
            <span className="font-medium text-foreground tabular-nums">
              {data[hoverIdx].count}회
            </span>
            <span className="ml-1.5 text-muted-foreground">
              {data[hoverIdx].label}
            </span>
          </div>
        )}
      </div>

      <div className="relative mt-1 h-5">
        {[0, Math.round((data.length - 1) / 2), data.length - 1].map((i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 text-[11px] text-muted-foreground"
            style={{ left: `${((x(i) / width) * 100).toFixed(3)}%` }}
          >
            {data[i].label}
          </span>
        ))}
      </div>
    </div>
  );
}


/* ----- 메인 컴포넌트 ----- */
export default function WishlistStatistics() {
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWishlistStats() {
      try {
        setLoading(true);
        setError(null);

        const ensureUser = async (): Promise<User | null> => {
          if (auth.currentUser) return auth.currentUser;
          return new Promise<User | null>((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((next) => {
              unsubscribe();
              resolve(next);
            });
          });
        };

        const user = await ensureUser();
        if (!user) {
          throw new Error("관리자 인증 정보가 없습니다. 다시 로그인해 주세요.");
        }

        const idToken = await user.getIdToken();
        const res = await fetch("/api/admin/wishlist/stats", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        const raw = await res.text();
        if (!res.ok) {
          let message = "찜하기 통계를 불러오지 못했습니다.";
          try {
            const payload = JSON.parse(raw) as { error?: string };
            if (payload.error) message = payload.error;
          } catch {
            /* ignore */
          }
          throw new Error(message);
        }

        const payload = JSON.parse(raw) as WishlistStatsResponse;
        if (!active) return;

        const parsedStats: WishlistStats = {
          ...payload,
          lastUpdated: new Date(payload.lastUpdated),
          latestFavorites: payload.latestFavorites.map((favorite) => ({
            ...favorite,
            createdAt: favorite.createdAt ? new Date(favorite.createdAt) : null,
          })),
        };

        setStats(parsedStats);
      } catch (err) {
        console.error("Failed to load wishlist statistics", err);
        if (!active) return;
        const message =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWishlistStats();
    return () => {
      active = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "전체 찜 수",
        description: "전체 기간 누적",
        value: stats.totalFavorites,
        suffix: "회",
        icon: Heart,
        formatter: integerFormatter,
      },
      {
        label: "최근 7일 신규 찜",
        description: "최근 7일",
        value: stats.newFavorites7d,
        suffix: "회",
        icon: Sparkles,
        formatter: integerFormatter,
      },
      {
        label: "찜 보유 사용자",
        description: "1개 이상 보유",
        value: stats.uniqueUsers,
        suffix: "명",
        icon: Users,
        formatter: integerFormatter,
      },
      {
        label: "1인 평균 찜 수",
        description: "보유 사용자 기준",
        value: stats.averageFavoritesPerUser,
        suffix: "회",
        icon: Layers,
        formatter: decimalFormatter,
      },
    ];
  }, [stats]);

  if (error) {
    return (
      <section className='space-y-6'>
        <div className='flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive'>
          <AlertCircle className='h-5 w-5 flex-shrink-0' />
          <div>
            <p className='font-semibold'>찜하기 통계를 불러오지 못했습니다.</p>
            <p className='mt-1 text-xs opacity-80'>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading || !stats) {
    return (
      <section className='space-y-8'>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='h-28 rounded-2xl border bg-muted/30 animate-pulse'
            />
          ))}
        </div>

        <div className='rounded-2xl border bg-background p-8 text-muted-foreground shadow-sm'>
          <div className='flex items-center justify-center gap-2 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' />
            찜하기 통계를 불러오는 중입니다...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='space-y-8'>
      {/* KPI */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {summaryCards.map((card) => (
          <KPICard key={card.label} {...card} />
        ))}
      </div>

      <p className='text-[11px] text-muted-foreground'>
        마지막 업데이트: {dateTimeFormatter.format(stats.lastUpdated)}
      </p>

      {/* 추세 차트 */}
      <SectionCard
        title='찜하기 추세'
        description='실제 사용자 데이터 기준. 주 1회 집계 기준으로 확인하세요.'
      >
        <div className='p-5'>
          {stats.weeklySeries.length ? (
            <WishlistTrendChart data={stats.weeklySeries} />
          ) : (
            <div className='flex h-32 items-center justify-center text-sm text-muted-foreground'>
              집계할 찜하기 데이터가 없습니다.
            </div>
          )}
        </div>
      </SectionCard>

      {/* 하단 2단 리스트 */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* 인기 찜 클리닉 */}
        <SectionCard
          title='인기 찜 클리닉'
          description='전체 찜하기 수 대비 점유율이 높은 상위 클리닉'
        >
          <div className='p-5'>
            {stats.topClinics.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                아직 찜한 클리닉 데이터가 없습니다.
              </p>
            ) : (
              <ul className='divide-y divide-border/60 rounded-xl border'>
                {stats.topClinics.map((clinic, index) => (
                  <li
                    key={clinic.clinicId}
                    className='grid grid-cols-[24px_1fr_auto] items-stretch gap-3 py-4 px-4'
                  >
                    {/* 순위 배지: 좌측 고정 칼럼 */}
                    <span className='mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[11px] text-muted-foreground'>
                      {index + 1}
                    </span>

                    {/* 본문: 배지/아이콘 제거 → 이름·주소 좌측 정렬 동일 시작점 */}
                    <div className='min-w-0 text-left grid content-between'>
                      <p className='truncate text-sm font-semibold text-foreground'>
                        {clinic.name}
                      </p>
                      <p className='truncate self-end text-[11px] leading-[1.15] text-muted-foreground'>
                        {clinic.address ?? "주소 정보 없음"}
                      </p>
                      {clinic.status === "hidden" && (
                        <span className='mt-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700'>
                          비노출 상태
                        </span>
                      )}
                    </div>

                    {/* 우측 지표: 고정폭 + 우측 정렬(변경 없음) */}
                    <div className='w-[76px] justify-self-end text-right grid content-between'>
                      <p className='text-base font-semibold text-foreground tabular-nums'>
                        {integerFormatter.format(clinic.totalFavorites)}
                        <span className='ml-0.5 text-sm text-muted-foreground'>
                          회
                        </span>
                      </p>
                      <p className='self-end text-[11px] leading-[1.15] text-muted-foreground'>
                        점유율 {decimalFormatter.format(clinic.share)}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionCard>

        {/* 최근 찜한 클리닉 */}
        <SectionCard title='최근 찜한 클리닉' description='최근 5개'>
          <div className='p-5'>
            {stats.latestFavorites.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                최근 등록된 찜 데이터가 없습니다.
              </p>
            ) : (
              <ul className='divide-y divide-border/60 rounded-xl border'>
                {stats.latestFavorites.map((favorite) => (
                  <li
                    key={`${favorite.userId}-${favorite.clinicId}-${
                      favorite.createdAt?.getTime() ?? "unknown"
                    }`}
                    className='grid grid-cols-[1fr_auto] items-stretch gap-4 px-6 py-4'
                  >
                    <div className='min-w-0 text-left grid content-between gap-1'>
                      <p className='truncate text-sm font-semibold text-foreground'>
                        {favorite.clinicName}
                      </p>
                      <p className='truncate self-end text-[11px] leading-[1.15] text-muted-foreground'>
                        {formatFavoriteUserLabel(favorite)}
                      </p>
                    </div>

                    <div className='w-[96px] justify-self-end self-start text-right text-[11px] leading-[1.15] text-muted-foreground tabular-nums'>
                      {favorite.createdAt
                        ? dateTimeFormatter.format(favorite.createdAt)
                        : "시간 정보 없음"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}

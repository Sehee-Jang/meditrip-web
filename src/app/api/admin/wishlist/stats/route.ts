import { NextRequest, NextResponse } from "next/server";
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  formatISO,
  isValid,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import { adminDb, getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";
import type { ClinicDoc } from "@/types/clinic";
import type { CategoryKey } from "@/constants/categories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RangePreset = "today" | "7d" | "30d" | "custom";
type SortField = "additions" | "cancellations" | "net" | "name" | "category";
type SortOrder = "asc" | "desc";

interface FavoriteRecord {
  clinicId: string;
  userId: string;
  createdAt: Date | null;
}

type WishlistEventType = "added" | "removed";

interface WishlistEvent {
  clinicId: string;
  userId: string;
  occurredAt: Date | null;
  type: WishlistEventType;
}

interface ClinicAggregate {
  additions: number;
  cancellations: number;
  net: number;
  userIds: Set<string>;
  daily: Map<string, { additions: number; cancellations: number }>;
  lastOccurredAt: Date | null;
}

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
  status?: ClinicDoc["status"];
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

interface SerializableWishlistStats
  extends Omit<
    WishlistStats,
    "period" | "latestFavorites" | "lastUpdated" | "clinics"
  > {
  period: Omit<WishlistStats["period"], "start" | "end"> & {
    start: string;
    end: string;
  };
  clinics: Array<
    Omit<ClinicRow, "dailySeries"> & { dailySeries: TrendPoint[] }
  >;
  latestFavorites: Array<
    Omit<LatestFavoriteRow, "occurredAt"> & { occurredAt: string | null }
  >;
  lastUpdated: string;
}

function normalizeDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function parsePreset(value: string | null): RangePreset {
  if (
    value === "today" ||
    value === "7d" ||
    value === "30d" ||
    value === "custom"
  ) {
    return value;
  }
  return "30d";
}

function parseSortField(value: string | null): SortField {
  if (
    value === "cancellations" ||
    value === "net" ||
    value === "name" ||
    value === "category"
  ) {
    return value;
  }
  return "additions";
}

function parseSortOrder(value: string | null): SortOrder {
  if (value === "asc" || value === "desc") return value;
  return "desc";
}

function parseDateInput(value: string | null): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;
  return null;
}

function resolvePeriod(
  preset: RangePreset,
  startInput: string | null,
  endInput: string | null
):
  | { ok: true; value: { preset: RangePreset; start: Date; end: Date } }
  | {
      ok: false;
      error: string;
    } {
  const now = new Date();

  if (preset === "today") {
    return {
      ok: true,
      value: {
        preset,
        start: startOfDay(now),
        end: endOfDay(now),
      },
    };
  }

  if (preset === "7d") {
    return {
      ok: true,
      value: {
        preset,
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
      },
    };
  }

  if (preset === "30d") {
    return {
      ok: true,
      value: {
        preset,
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      },
    };
  }

  const start = parseDateInput(startInput);
  const end = parseDateInput(endInput);

  if (!start || !end) {
    return {
      ok: false,
      error: "사용자 지정 기간은 시작일과 종료일이 필요합니다.",
    };
  }

  const normalizedStart = startOfDay(start);
  const normalizedEnd = endOfDay(end);

  if (normalizedStart > normalizedEnd) {
    return {
      ok: false,
      error: "시작일은 종료일보다 늦을 수 없습니다.",
    };
  }

  return {
    ok: true,
    value: {
      preset,
      start: normalizedStart,
      end: normalizedEnd,
    },
  };
}

function computePreviousRange(start: Date, end: Date) {
  const duration = differenceInCalendarDays(end, start) + 1;
  const previousEnd = endOfDay(subDays(start, 1));
  const previousStart = startOfDay(subDays(previousEnd, duration - 1));
  return { start: previousStart, end: previousEnd };
}

function computeDelta(current: number, previous: number): DeltaSummary {
  const absolute = current - previous;
  const percent = previous === 0 ? null : (absolute / previous) * 100;
  return {
    current,
    previous,
    absolute,
    percent,
  };
}

async function fetchWishlistEvents(): Promise<WishlistEvent[]> {
  try {
    const snapshot = await adminDb().collectionGroup("wishlistEvents").get();
    if (snapshot.empty) return [];

    const events: WishlistEvent[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const clinicIdRaw =
        data.clinicId ?? data.clinic ?? doc.get("clinic") ?? null;
      const userIdRaw =
        data.userId ?? data.user ?? doc.ref.parent.parent?.id ?? null;
      const occurredAt = normalizeDate(
        data.occurredAt ?? data.createdAt ?? data.timestamp ?? null
      );
      const typeRaw = (data.type ?? data.action ?? data.eventType ?? "") as
        | string
        | null;

      if (
        typeof clinicIdRaw !== "string" ||
        typeof userIdRaw !== "string" ||
        !clinicIdRaw.trim() ||
        !userIdRaw.trim()
      ) {
        return;
      }

      let type: WishlistEventType = "added";
      if (typeof typeRaw === "string") {
        const lowered = typeRaw.toLowerCase();
        if (lowered.includes("remove") || lowered.includes("cancel")) {
          type = "removed";
        }
      }

      events.push({
        clinicId: clinicIdRaw,
        userId: userIdRaw,
        occurredAt,
        type,
      });
    });

    return events;
  } catch (error) {
    console.error("Failed to fetch wishlistEvents collectionGroup", error);
    return [];
  }
}

function toSerializable(stats: WishlistStats): SerializableWishlistStats {
  return {
    ...stats,
    period: {
      ...stats.period,
      start: stats.period.start.toISOString(),
      end: stats.period.end.toISOString(),
    },
    clinics: stats.clinics.map((clinic) => ({
      ...clinic,
      dailySeries: clinic.dailySeries.map((point) => ({ ...point })),
    })),
    latestFavorites: stats.latestFavorites.map((favorite) => ({
      ...favorite,
      occurredAt: favorite.occurredAt
        ? favorite.occurredAt.toISOString()
        : null,
    })),
    lastUpdated: stats.lastUpdated.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getFirebaseUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const presetParam = parsePreset(searchParams.get("range"));
    const compareToPrevious = searchParams.get("compare") === "true";
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "10", 10);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;
    const sortField = parseSortField(searchParams.get("sort"));
    const sortOrder = parseSortOrder(searchParams.get("order"));

    const periodResult = resolvePeriod(
      presetParam,
      searchParams.get("start"),
      searchParams.get("end")
    );

    if (!periodResult.ok) {
      return NextResponse.json({ error: periodResult.error }, { status: 400 });
    }

    const {
      value: { preset, start, end },
    } = periodResult;

    const searchQuery = searchParams.get("search")?.trim().toLowerCase() ?? "";
    const categoryParam = searchParams.get("category")?.trim().toLowerCase();
    const categoryFilter =
      categoryParam && categoryParam.length
        ? (categoryParam as CategoryKey)
        : null;

    const favoritesSnapshot = await adminDb()
      .collectionGroup("favorites")
      .get();
    const favorites: FavoriteRecord[] = [];

    favoritesSnapshot.forEach((doc) => {
      const data = doc.data() as {
        createdAt?: unknown;
        clinicId?: unknown;
        clinic?: unknown;
        clinicRef?: unknown;
        userId?: unknown;
      };

      const parentUserId = doc.ref.parent.parent?.id;
      const userId =
        (typeof data.userId === "string" && data.userId.trim()) || parentUserId;

      let clinicId: string | null = null;
      if (typeof data.clinicId === "string" && data.clinicId.trim()) {
        clinicId = data.clinicId;
      } else if (typeof data.clinic === "string" && data.clinic.trim()) {
        clinicId = data.clinic;
      } else if (
        data.clinicRef &&
        typeof data.clinicRef === "object" &&
        data.clinicRef !== null &&
        "id" in data.clinicRef &&
        typeof (data.clinicRef as { id?: unknown }).id === "string"
      ) {
        clinicId = (data.clinicRef as { id: string }).id;
      } else if (doc.id) {
        clinicId = doc.id;
      }

      if (!userId || !clinicId) {
        return;
      }

      favorites.push({
        clinicId,
        userId,
        createdAt: normalizeDate(data.createdAt ?? null),
      });
    });

    let events = await fetchWishlistEvents();

    if (events.length === 0) {
      events = favorites
        .filter((favorite) => favorite.createdAt)
        .map((favorite) => ({
          clinicId: favorite.clinicId,
          userId: favorite.userId,
          occurredAt: favorite.createdAt,
          type: "added" as const,
        }));
    }

    const periodEvents = events.filter(
      (event) =>
        event.occurredAt && event.occurredAt >= start && event.occurredAt <= end
    );

    const previousRange = computePreviousRange(start, end);
    const previousEvents = compareToPrevious
      ? events.filter(
          (event) =>
            event.occurredAt &&
            event.occurredAt >= previousRange.start &&
            event.occurredAt <= previousRange.end
        )
      : [];

    let additions = 0;
    let cancellations = 0;
    const uniqueUsers = new Set<string>();
    const uniqueClinics = new Set<string>();
    const trendMap = new Map<
      string,
      { additions: number; cancellations: number }
    >();
    const clinicAggregates = new Map<string, ClinicAggregate>();

    periodEvents.forEach((event) => {
      if (!event.occurredAt) return;
      const dayKey = formatISO(startOfDay(event.occurredAt), {
        representation: "date",
      });
      const trendEntry = trendMap.get(dayKey) ?? {
        additions: 0,
        cancellations: 0,
      };

      if (event.type === "removed") {
        trendEntry.cancellations += 1;
        cancellations += 1;
      } else {
        trendEntry.additions += 1;
        additions += 1;
        uniqueUsers.add(event.userId);
      }

      trendMap.set(dayKey, trendEntry);

      const aggregate = clinicAggregates.get(event.clinicId) ?? {
        additions: 0,
        cancellations: 0,
        net: 0,
        userIds: new Set<string>(),
        daily: new Map<string, { additions: number; cancellations: number }>(),
        lastOccurredAt: null,
      };

      if (event.type === "removed") {
        aggregate.cancellations += 1;
      } else {
        aggregate.additions += 1;
        aggregate.userIds.add(event.userId);
      }

      aggregate.net = aggregate.additions - aggregate.cancellations;

      const clinicDaily = aggregate.daily.get(dayKey) ?? {
        additions: 0,
        cancellations: 0,
      };
      if (event.type === "removed") {
        clinicDaily.cancellations += 1;
      } else {
        clinicDaily.additions += 1;
      }
      aggregate.daily.set(dayKey, clinicDaily);

      if (
        !aggregate.lastOccurredAt ||
        event.occurredAt > aggregate.lastOccurredAt
      ) {
        aggregate.lastOccurredAt = event.occurredAt;
      }

      clinicAggregates.set(event.clinicId, aggregate);
      uniqueClinics.add(event.clinicId);
    });

    const totalActions = additions + cancellations;
    const netChange = additions - cancellations;
    const averageFavoritesPerUser = uniqueUsers.size
      ? additions / uniqueUsers.size
      : 0;

    const trend: TrendPoint[] = [];
    const totalDays = differenceInCalendarDays(end, start) + 1;
    for (let i = 0; i < totalDays; i += 1) {
      const currentDate = addDays(start, i);
      const key = formatISO(startOfDay(currentDate), {
        representation: "date",
      });
      const entry = trendMap.get(key) ?? { additions: 0, cancellations: 0 };
      trend.push({
        date: key,
        additions: entry.additions,
        cancellations: entry.cancellations,
        net: entry.additions - entry.cancellations,
      });
    }

    const clinicIds = Array.from(clinicAggregates.keys());
    const clinicSnaps = await Promise.all(
      clinicIds.map(async (clinicId) => {
        const snap = await adminDb().collection("clinics").doc(clinicId).get();
        if (!snap.exists) return null;
        return { id: snap.id, data: snap.data() as ClinicDoc };
      })
    );

    const clinicMap = new Map<string, ClinicDoc>();
    clinicSnaps.forEach((entry) => {
      if (!entry) return;
      clinicMap.set(entry.id, entry.data);
    });

    const clinicRows: ClinicRow[] = clinicIds.map((clinicId) => {
      const aggregate = clinicAggregates.get(clinicId)!;
      const clinic = clinicMap.get(clinicId);
      const categoryKeys = Array.isArray(clinic?.categoryKeys)
        ? (clinic?.categoryKeys.filter(Boolean) as CategoryKey[])
        : [];

      const dailySeries: TrendPoint[] = [];
      for (let i = 0; i < totalDays; i += 1) {
        const currentDate = addDays(start, i);
        const key = formatISO(startOfDay(currentDate), {
          representation: "date",
        });
        const entry = aggregate.daily.get(key) ?? {
          additions: 0,
          cancellations: 0,
        };
        dailySeries.push({
          date: key,
          additions: entry.additions,
          cancellations: entry.cancellations,
          net: entry.additions - entry.cancellations,
        });
      }

      return {
        clinicId,
        name: clinic?.name?.ko ?? clinic?.name?.ja ?? `${clinicId} (정보 없음)`,
        address: clinic?.address?.ko ?? clinic?.address?.ja ?? undefined,
        status: clinic?.status,
        categoryKeys,
        additions: aggregate.additions,
        cancellations: aggregate.cancellations,
        net: aggregate.net,
        share: additions ? (aggregate.additions / additions) * 100 : 0,
        userCount: aggregate.userIds.size,
        dailySeries,
      };
    });

    const filteredClinicRows = clinicRows.filter((row) => {
      if (searchQuery) {
        const matchesName = row.name.toLowerCase().includes(searchQuery);
        const matchesId = row.clinicId.toLowerCase().includes(searchQuery);
        if (!matchesName && !matchesId) {
          return false;
        }
      }

      if (categoryFilter) {
        return row.categoryKeys.includes(categoryFilter);
      }

      return true;
    });

    const sortedClinicRows = filteredClinicRows.sort((a, b) => {
      if (sortField === "name") {
        return (
          a.name.localeCompare(b.name, "ko") * (sortOrder === "asc" ? 1 : -1)
        );
      }

      if (sortField === "category") {
        const aCategory = a.categoryKeys[0] ?? "";
        const bCategory = b.categoryKeys[0] ?? "";
        return (
          aCategory.localeCompare(bCategory, "ko") *
          (sortOrder === "asc" ? 1 : -1)
        );
      }

      const fieldA =
        sortField === "cancellations"
          ? a.cancellations
          : sortField === "net"
          ? a.net
          : a.additions;
      const fieldB =
        sortField === "cancellations"
          ? b.cancellations
          : sortField === "net"
          ? b.net
          : b.additions;

      if (fieldA === fieldB) {
        return b.additions - a.additions;
      }

      return (fieldA - fieldB) * (sortOrder === "asc" ? 1 : -1);
    });

    const limitedClinicRows = sortedClinicRows.slice(0, limit);

    const latestAdditions = periodEvents
      .filter((event) => event.type === "added" && event.occurredAt)
      .sort(
        (a, b) =>
          (b.occurredAt?.getTime() ?? 0) - (a.occurredAt?.getTime() ?? 0)
      )
      .slice(0, 10);

    const userIds = new Set<string>();
    latestAdditions.forEach((event) => {
      userIds.add(event.userId);
    });

    const userSnaps = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const snap = await adminDb().collection("users").doc(userId).get();
        if (!snap.exists) return null;
        return { id: snap.id, data: snap.data() as Record<string, unknown> };
      })
    );

    const userMap = new Map<
      string,
      {
        name: string | null;
        email: string | null;
      }
    >();

    userSnaps.forEach((entry) => {
      if (!entry) return;
      const { id, data } = entry;

      const extractName = (): string | null => {
        if (typeof data.nickname === "string" && data.nickname.trim()) {
          return data.nickname.trim();
        }
        if (typeof data.name === "string" && data.name.trim()) {
          return data.name.trim();
        }
        if (typeof data.displayName === "string" && data.displayName.trim()) {
          return data.displayName.trim();
        }

        const profile = data.profile;
        if (profile && typeof profile === "object" && profile !== null) {
          const profileName = (profile as { name?: unknown }).name;
          if (profileName && typeof profileName === "object") {
            const ko = (profileName as { ko?: unknown }).ko;
            if (typeof ko === "string" && ko.trim()) return ko.trim();
            const ja = (profileName as { ja?: unknown }).ja;
            if (typeof ja === "string" && ja.trim()) return ja.trim();
          }
        }

        return null;
      };

      const extractEmail = (): string | null => {
        if (typeof data.email === "string" && data.email.trim()) {
          return data.email.trim();
        }
        if (typeof data.userEmail === "string" && data.userEmail.trim()) {
          return data.userEmail.trim();
        }
        return null;
      };

      userMap.set(id, {
        name: extractName(),
        email: extractEmail(),
      });
    });

    const latestFavorites: LatestFavoriteRow[] = latestAdditions.map(
      (event) => {
        const clinic = clinicMap.get(event.clinicId);
        const user = userMap.get(event.userId);
        return {
          clinicId: event.clinicId,
          clinicName: clinic?.name?.ko ?? clinic?.name?.ja ?? event.clinicId,
          userId: event.userId,
          userName: user?.name ?? null,
          userEmail: user?.email ?? null,
          occurredAt: event.occurredAt ?? null,
        };
      }
    );

    const previousAdditions = previousEvents.filter(
      (event) => event.type === "added" && event.occurredAt
    ).length;
    const previousCancellations = previousEvents.filter(
      (event) => event.type === "removed" && event.occurredAt
    ).length;
    const previousTotalActions = previousAdditions + previousCancellations;
    const previousNet = previousAdditions - previousCancellations;

    const stats: WishlistStats = {
      period: {
        preset,
        start,
        end,
        compareToPrevious,
      },
      totals: {
        totalActions,
        additions,
        cancellations,
        netChange,
        uniqueUsers: uniqueUsers.size,
        uniqueClinics: uniqueClinics.size,
        averageFavoritesPerUser,
      },
      comparison: compareToPrevious
        ? {
            totalActions: computeDelta(totalActions, previousTotalActions),
            additions: computeDelta(additions, previousAdditions),
            cancellations: computeDelta(cancellations, previousCancellations),
            netChange: computeDelta(netChange, previousNet),
          }
        : undefined,
      trend,
      clinics: limitedClinicRows,
      latestFavorites,
      lastUpdated: new Date(),
    };

    return NextResponse.json(toSerializable(stats));
  } catch (e) {
    const message =
      e instanceof Error && e.message === "FIREBASE_ADMIN_ENV_MISSING"
        ? "Server misconfigured (Firebase Admin env missing)"
        : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

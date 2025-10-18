import { NextRequest, NextResponse } from "next/server";
import { endOfWeek, startOfWeek, subDays, subWeeks } from "date-fns";

import { adminDb, getFirebaseUserFromRequest } from "@/lib/firebaseAdmin";
import type { ClinicDoc } from "@/types/clinic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FavoriteRecord {
  clinicId: string;
  userId: string;
  createdAt: Date | null;
}

interface WeeklyPoint {
  label: string;
  count: number;
}

interface TopClinicRow {
  clinicId: string;
  name: string;
  address?: string;
  status?: ClinicDoc["status"];
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
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function buildWeeklySeries(
  favorites: FavoriteRecord[],
  weeks = 8
): WeeklyPoint[] {
  const now = new Date();
  const series: WeeklyPoint[] = [];

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const end = endOfWeek(start, { weekStartsOn: 1 });

    const count = favorites.reduce((acc, favorite) => {
      if (!favorite.createdAt) return acc;
      if (favorite.createdAt >= start && favorite.createdAt <= end) {
        return acc + 1;
      }
      return acc;
    }, 0);

    series.push({
      label:
        `${start.getMonth() + 1}`.padStart(2, "0") +
        "." +
        `${start.getDate()}`.padStart(2, "0"),
      count,
    });
  }

  return series;
}

function toSerializable(stats: WishlistStats) {
  return {
    ...stats,
    lastUpdated: stats.lastUpdated.toISOString(),
    weeklySeries: stats.weeklySeries.map((point) => ({ ...point })),
    topClinics: stats.topClinics.map((clinic) => ({ ...clinic })),
    latestFavorites: stats.latestFavorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt ? favorite.createdAt.toISOString() : null,
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getFirebaseUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb().collectionGroup("favorites").get();

    const favorites: FavoriteRecord[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as {
        createdAt?: unknown;
        clinicId?: unknown;
        clinic?: unknown;
        clinicRef?: unknown;
        userId?: unknown;
      };

      const parentUserId = doc.ref.parent.parent?.id;
      const userId =
        (typeof data.userId === "string" && data.userId.trim()) ||
        parentUserId ||
        null;

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

    const totalFavorites = favorites.length;
    const uniqueUsers = new Set(favorites.map((favorite) => favorite.userId));
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const newFavorites7d = favorites.reduce((acc, favorite) => {
      if (!favorite.createdAt) return acc;
      if (favorite.createdAt >= sevenDaysAgo) return acc + 1;
      return acc;
    }, 0);

    const clinicCounts = new Map<string, number>();
    favorites.forEach((favorite) => {
      clinicCounts.set(
        favorite.clinicId,
        (clinicCounts.get(favorite.clinicId) ?? 0) + 1
      );
    });

    const topEntries = Array.from(clinicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const latestFavoritesRaw = [...favorites]
      .sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);

    const clinicIdsToFetch = new Set<string>();
    topEntries.forEach(([clinicId]) => clinicIdsToFetch.add(clinicId));
    latestFavoritesRaw.forEach((favorite) =>
      clinicIdsToFetch.add(favorite.clinicId)
    );

    const clinicSnaps = await Promise.all(
      Array.from(clinicIdsToFetch).map(async (clinicId) => {
        const snap = await adminDb().collection("clinics").doc(clinicId).get();
        if (!snap.exists) return null;
        return { id: snap.id, data: snap.data() as ClinicDoc };
      })
    );

    const clinicMap = new Map<string, ClinicDoc>();
    clinicSnaps.forEach((entry) => {
      if (entry) {
        clinicMap.set(entry.id, entry.data);
      }
    });

    const weeklySeries = buildWeeklySeries(favorites);

    const topClinics: TopClinicRow[] = topEntries.map(([clinicId, count]) => {
      const clinic = clinicMap.get(clinicId);
      const share = totalFavorites ? (count / totalFavorites) * 100 : 0;
      return {
        clinicId,
        name: clinic?.name?.ko ?? clinic?.name?.ja ?? `${clinicId} (정보 없음)`,
        address: clinic?.address?.ko ?? clinic?.address?.ja ?? undefined,
        status: clinic?.status,
        totalFavorites: count,
        share,
      };
    });

    const userIdsToFetch = new Set<string>();
    latestFavoritesRaw.forEach((favorite) =>
      userIdsToFetch.add(favorite.userId)
    );

    const userSnaps = await Promise.all(
      Array.from(userIdsToFetch).map(async (userId) => {
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

    const latestFavorites: LatestFavoriteRow[] = latestFavoritesRaw.map(
      (favorite) => {
        const clinic = clinicMap.get(favorite.clinicId);
        const user = userMap.get(favorite.userId);
        return {
          clinicId: favorite.clinicId,
          clinicName: clinic?.name?.ko ?? clinic?.name?.ja ?? favorite.clinicId,
          userId: favorite.userId,
          userName: user?.name ?? null,
          userEmail: user?.email ?? null,
          createdAt: favorite.createdAt,
        };
      }
    );

    const stats: WishlistStats = {
      totalFavorites,
      newFavorites7d,
      uniqueUsers: uniqueUsers.size,
      averageFavoritesPerUser: uniqueUsers.size
        ? totalFavorites / uniqueUsers.size
        : 0,
      weeklySeries,
      topClinics,
      latestFavorites,
      lastUpdated: now,
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

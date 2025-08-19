import { Timestamp } from "firebase/firestore";

export type DateInput = Date | string | number | Timestamp | null | undefined;

function toDateSafe(value: DateInput): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (value instanceof Timestamp) return value.toDate();

  if (typeof value === "number") {
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function isDateInput(v: unknown): v is DateInput {
  return (
    v instanceof Date ||
    v instanceof Timestamp ||
    typeof v === "string" ||
    typeof v === "number" ||
    v === null ||
    typeof v === "undefined"
  );
}

/** 날짜만: 2025.08.14 */
export function formatDateCompact(value: unknown): string {
  if (!isDateInput(value)) return "날짜없음";
  const d = toDateSafe(value);
  if (!d) return "날짜없음";

  // Asia/Seoul 기준으로 2자리씩 추출
  const fmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}.${m}.${day}`;
}

/** 날짜+시간(초 없음): 2025.08.14 17:44 */
export function formatDateTimeCompact(value: unknown): string {
  if (!isDateInput(value)) return "날짜없음";
  const d = toDateSafe(value);
  if (!d) return "날짜없음";

  const fmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24시간제
  });
  const parts = fmt.formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const min = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${y}.${m}.${day} ${h}:${min}`;
}

/** 필요 시 그대로 유지해서 쓸 수 있는 ISO 변환 */
export function toISO(value: unknown): string {
  if (!isDateInput(value)) return "";
  const d = toDateSafe(value);
  return d ? d.toISOString() : "";
}

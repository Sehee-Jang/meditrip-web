// utils/date.ts
export function getFormattedDate(date: unknown): string {
  if (
    date &&
    typeof date === "object" &&
    "seconds" in date &&
    typeof (date as { seconds: unknown }).seconds === "number"
  ) {
    const { seconds, nanoseconds = 0 } = date as {
      seconds: number;
      nanoseconds?: number;
    };
    const millis = seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
    return new Date(millis).toLocaleDateString();
  }

  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof (date as { toDate: () => Date }).toDate === "function"
  ) {
    return (date as { toDate: () => Date }).toDate().toLocaleDateString();
  }

  return "날짜 없음";
}

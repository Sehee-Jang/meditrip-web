import { Timestamp } from "firebase/firestore";

export function getFormattedDate(value: Date | string | Timestamp): string {
  let dateObj: Date;

  if (typeof value === "string") {
    dateObj = new Date(value);
  } else if (value instanceof Timestamp) {
    dateObj = value.toDate();
  } else {
    dateObj = value;
  }

  if (isNaN(dateObj.getTime())) {
    return "날짜없음";
  }

  // 예: "2025.07.30"
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

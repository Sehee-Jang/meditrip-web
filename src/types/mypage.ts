export interface Reservation {
  id: string;
  clinic: string;
  date: string; // 표시용 포맷 문자열
  status: "completed" | "pending" | string;
}

export interface MyQuestion {
  id: string;
  title: string;
  date: string; // YYYY.MM.DD
  answered: boolean;
}


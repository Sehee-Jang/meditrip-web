import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

export type EventTriggerType =
  | "community_post"
  | "community_comment"
  | "clinic_review"
  | "login_daily"
  | "consultation_request";

type AwardPayload = {
  triggerType: EventTriggerType;
  subjectId?: string;
};

async function ensureUser(timeoutMs = 3000): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const user = await new Promise<User | null>((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve(null);
    }, timeoutMs);
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timer);
      unsub();
      resolve(u);
    });
  });
  if (!user) throw new Error("NOT_AUTHENTICATED");
  return user;
}

async function getFreshIdToken(): Promise<string> {
  const user = await ensureUser();
  const token = await user.getIdToken(true);
  if (!token) throw new Error("NO_ID_TOKEN");
  return token;
}

/** 서버에 트리거/대상ID를 넘겨 이벤트 정책대로 포인트 지급 */
export async function awardViaApi(payload: AwardPayload): Promise<boolean> {
  const token = await getFreshIdToken();

  const res = await fetch("/api/points/award", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, idToken: token }),
  });

  if (!res.ok) {
    try {
      const data = (await res.json()) as {
        ok: boolean;
        reason?: string;
        detail?: string;
      };
      console.warn("[awardViaApi] failed:", data.reason, data.detail ?? "");
    } catch {
      // ignore
    }
    return false;
  }

  const data = (await res.json()) as {
    ok: true;
    awarded: boolean;
    points?: number;
    logId?: string;
  };
  return data.awarded;
}

import type { FieldValue } from "firebase/firestore";

export type EventCondition = "firstPostOnly" | "oncePerDay" | "unlimited";

export type EventTriggerType =
  | "community_post"
  | "community_comment"
  | "clinic_review"
  | "login_daily"
  | "consultation_request";

export interface Event {
  id?: string;
  description: string;
  points: number;
  condition: EventCondition;
  triggerType: EventTriggerType;
  active: boolean;
  createdAt: Date | FieldValue;
}

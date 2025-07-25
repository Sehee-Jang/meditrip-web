import {
  Brain,
  Salad,
  ShieldCheck,
  Stethoscope,
  Hourglass,
} from "lucide-react";

export const CATEGORIES = {
  stress: "stress",
  diet: "diet",
  immunity: "immunity",
  women: "women",
  antiaging: "antiaging",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_ICONS: Record<CategoryKey, React.ElementType> = {
  stress: Brain,
  diet: Salad,
  immunity: ShieldCheck,
  women: Stethoscope,
  antiaging: Hourglass,
};

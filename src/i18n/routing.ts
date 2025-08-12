import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["ko", "ja"],

  // Used when no locale matches
  defaultLocale: "ko",
  localePrefix: "always", //  접두 항상 유지
});

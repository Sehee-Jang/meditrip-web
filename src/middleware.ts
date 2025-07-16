import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

// import { NextRequest } from "next/server";
// import createMiddleware from "next-intl/middleware";

// export default function middleware(request: NextRequest) {
//   const handleI18nRouting = createMiddleware({
//     locales: ["ko", "ja"],
//     defaultLocale: "ko",
//     pathnames: {
//       "/": "/",
//     },
//   });

//   console.log("✅ middleware triggered: ", request.nextUrl.pathname);

//   return handleI18nRouting(request);
// }

// export const config = {
//   matcher: ["/((?!_next|favicon.ico).*)"],
// };

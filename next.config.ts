import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",

  // IFRAME 임베드 허용(인증/지도/설문 등)
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://www.google.com https://maps.google.com https://*.google.com https://map.naver.com https://*.naver.com https://map.kakao.com https://*.kakao.com https://*.surveymonkey.com https://www.youtube.com",

  // 클릭재킹 방지(우리 사이트를 다른 도메인이 프레임으로 못 품도록)
  "frame-ancestors 'self'",

  // 이미지/스타일/스크립트/폰트/네트워크
  "img-src 'self' data: blob: https:",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'", // Next inlined script 허용
    isDev ? "'unsafe-eval'" : "", // 개발에서만 eval 허용
    "https://www.gstatic.com",
    "https://apis.google.com",
    "https://accounts.google.com",
    "https:",
  ]
    .filter(Boolean)
    .join(" "),
  "style-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https://firestore.googleapis.com https://oauth2.googleapis.com https://www.googleapis.com https://accounts.google.com https:",
  "font-src 'self' https: data:",

  // (선택) 워커/미디어 사용 시
  "worker-src 'self' blob:",
  "media-src 'self' https:",
].join("; ");

const securityHeaders = [{ key: "Content-Security-Policy", value: csp }];

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [360, 414, 768, 1024, 1280, 1600],
    imageSizes: [160, 240, 320, 360, 420, 480, 640, 800],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "pfzwkpvubunanobhsicu.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
    ],
  },
  sassOptions: { quietDeps: true },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

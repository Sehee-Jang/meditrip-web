import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const csp = [
  "default-src 'self'",
  // 인증 IFRAME & 지도 등 임베드
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com https://www.google.com https://maps.google.com https://*.google.com https://map.naver.com https://*.naver.com https://map.kakao.com https://*.kakao.com",
  // 이미지/스타일/스크립트 최소 허용
  "img-src 'self' data: blob: https:",
  // Firebase/Google 스크립트 로드
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://accounts.google.com https:",
  "style-src 'self' 'unsafe-inline' https:",
  // Firebase Auth/Firestore 통신 허용
  "connect-src 'self' https://firestore.googleapis.com https://oauth2.googleapis.com https://www.googleapis.com https://accounts.google.com https:",
  "font-src 'self' https: data:",
].join("; ");

const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: "Content-Security-Policy",
    value: csp,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "pfzwkpvubunanobhsicu.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
    ],
  },
  // Sass 의존성(deps)에서 나오는 deprecation 로그를 줄임
  sassOptions: {
    quietDeps: true,
  },

  webpack(config) {
    // @ → src 로 매핑
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

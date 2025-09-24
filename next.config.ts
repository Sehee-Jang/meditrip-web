import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: "Content-Security-Policy",
    // 필요한 것만 최소 허용. 기존에 별도 CSP가 있다면 거기에 frame-src 라인만 추가해도 됩니다.
    value: [
      "default-src 'self'",
      // 지도 임베드 허용 도메인
      "frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com https://map.naver.com https://*.naver.com https://map.kakao.com https://*.kakao.com",
      // 기본적으로 이미지/스타일/스크립트 등은 안전한 최소치로
      "img-src 'self' data: blob: https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "connect-src 'self' https: wss:",
      "font-src 'self' https: data:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  /* config options here */
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

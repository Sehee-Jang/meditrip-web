import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

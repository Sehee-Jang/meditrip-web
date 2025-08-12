import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "pfzwkpvubunanobhsicu.supabase.co",
      "i.ytimg.com",
      // 콘텐츠 썸네일/채널 이미지까지 대비
      "img.youtube.com",
      "yt3.ggpht.com",
    ],
  },
  webpack(config) {
    // @ → src 로 매핑
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

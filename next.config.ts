import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["pfzwkpvubunanobhsicu.supabase.co"],
  },
  webpack(config) {
    // @ → src 로 매핑
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

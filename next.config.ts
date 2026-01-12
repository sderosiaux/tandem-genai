import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

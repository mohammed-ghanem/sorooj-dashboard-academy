import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend-academy.sorooj.org",
      },
      
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
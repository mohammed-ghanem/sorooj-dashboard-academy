import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir:
    process.env.NEXT_PUBLIC_PORTAL === "doctor" ? ".next-doctor" : ".next",
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
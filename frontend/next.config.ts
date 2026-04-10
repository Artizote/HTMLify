import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  allowedDevOrigins: [
    "localhost:3000",
    "my.localhost",
    "localhost",
    "localhost:4000",
  ],
};

export default nextConfig;

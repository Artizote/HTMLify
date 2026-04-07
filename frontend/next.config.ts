import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "localhost:3000",
    "my.localhost",
    "localhost",
    "localhost:4000",
  ],
};

export default nextConfig;

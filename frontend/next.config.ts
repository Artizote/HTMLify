import type { NextConfig } from "next";

import { DASHBOARD_ROUTES } from "./lib/modules/proxy/proxy.config";

const bodySizeMB = parseInt(process.env.PROXY_MAX_BODY_SIZE_MB || "32", 10);

const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL;
const subdomain = process.env.NEXT_PUBLIC_SUBDOMAIN;

if (!siteUrlRaw || !subdomain) {
  throw new Error("NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_SUBDOMAIN are required in .env");
}

const siteUrl = new URL(siteUrlRaw);

const protocol = siteUrl.protocol.replace(":", "") as "http" | "https";
const mainHostname = siteUrl.hostname;
const dashboardHostname = `${subdomain}.${mainHostname}`;
const mainHost = siteUrl.host;
const dashboardHost = `${subdomain}.${mainHost}`;
const mainOrigin = siteUrl.origin;

const dashboardPattern = DASHBOARD_ROUTES.map(
  (route) => `${route.slice(1)}(?:/|$)`,
).join("|");

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: `${bodySizeMB}mb`,
  },

  images: {
    remotePatterns: [
      {
        protocol,
        hostname: mainHostname,
      },
      {
        protocol,
        hostname: dashboardHostname,
      },
    ],
  },

  allowedDevOrigins: [mainHost, dashboardHost],

  async redirects() {
    return [
      // Root of dashboard subdomain -> /dashboard
      {
        source: "/",
        has: [{ type: "host", value: dashboardHostname }],
        destination: "/dashboard",
        permanent: true,
      },
      // Everything else on the dashboard subdomain except dashboard routes,
      // same-origin API routes, internal Next.js paths and the root (root stays on the subdomain)
      // Those must stay on the subdomain so auth cookies reach them.
      {
        source: `/:path((?!${dashboardPattern}|api(?:/|$)|_next(?:/|$)).+)`,
        has: [{ type: "host", value: dashboardHostname }],
        destination: `${mainOrigin}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

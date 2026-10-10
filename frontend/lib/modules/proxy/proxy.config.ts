export const excludePaths = [
  "/about",
  "/search",
  "/_next",
  "/api",
  "/favicon.ico",
  "/favicon.svg",
  "/.well-known",
];

export const AUTH_ONLY_ROUTES = ["/signin", "/signup"];
export const PROTECTED_ROUTES = ["/dashboard"];
export const DASHBOARD_ROUTES = [
  ...AUTH_ONLY_ROUTES,
  ...PROTECTED_ROUTES,
];

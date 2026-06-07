export const VISITOR_COOKIE = "portfolio_visitor_id";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const TRACKABLE_PATH_PREFIXES = [
  "/",
  "/about",
  "/projects",
  "/contact",
  "/analytics",
] as const;

export function isTrackablePath(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api"))
    return false;
  if (pathname.startsWith("/projects/")) return true;
  return TRACKABLE_PATH_PREFIXES.includes(
    pathname as (typeof TRACKABLE_PATH_PREFIXES)[number],
  );
}

export type AppRole = "resident" | "staff" | "admin";

/**
 * Maps route prefixes to the roles allowed to access them.
 * "/portal" -> resident, "/staff" -> staff or admin (the Admin sidebar links
 * directly into the staff modules rather than duplicating them), "/admin" -> admin only.
 */
export const PROTECTED_PREFIXES: Record<string, AppRole[]> = {
  "/portal": ["resident"],
  "/staff": ["staff", "admin"],
  "/admin": ["admin"],
};

export function matchProtectedPrefix(pathname: string) {
  return Object.keys(PROTECTED_PREFIXES).find((prefix) => pathname.startsWith(prefix));
}

/** Where a signed-in user of this role should land by default. */
export function roleHomePath(role: AppRole | null | undefined): string {
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/portal";
}

/**
 * True if this role is allowed at this path — either it's not a protected
 * route at all, or the role is in that prefix's allow-list.
 */
export function isRoleAllowedForPath(role: AppRole | null | undefined, pathname: string): boolean {
  const prefix = matchProtectedPrefix(pathname);
  if (!prefix) return true;
  if (!role) return false;
  return PROTECTED_PREFIXES[prefix].includes(role);
}

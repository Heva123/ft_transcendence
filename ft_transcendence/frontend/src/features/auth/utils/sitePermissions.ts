import type {
  CurrentUser,
  SiteRole,
} from "../api/userApi";

export function getSiteRole(
  user:
    | Pick<CurrentUser, "siteRole">
    | null
    | undefined
): SiteRole {
  return user?.siteRole ?? "USER";
}

export function isSiteAdmin(
  user:
    | Pick<CurrentUser, "siteRole">
    | null
    | undefined
) {
  return (
    getSiteRole(user) === "ADMIN"
  );
}

export function isSiteGuest(
  user:
    | Pick<CurrentUser, "siteRole">
    | null
    | undefined
) {
  return (
    getSiteRole(user) === "GUEST"
  );
}

export function canWriteSite(
  user:
    | Pick<CurrentUser, "siteRole">
    | null
    | undefined
) {
  return !isSiteGuest(user);
}
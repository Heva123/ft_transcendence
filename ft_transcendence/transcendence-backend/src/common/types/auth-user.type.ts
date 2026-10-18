import { SiteRole } from "@prisma/client";

export type AuthUser = {
  id: string;
  siteRole?: SiteRole;
  email: string;
  username: string;
};

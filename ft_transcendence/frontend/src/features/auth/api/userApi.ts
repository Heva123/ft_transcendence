import {
  apiRequest,
} from "../../../api/apiClient";

export type SiteRole =
  | "ADMIN"
  | "USER"
  | "GUEST";

export type CurrentUser = {
  id: string;
  email: string;
  username: string;
  siteRole?: SiteRole;
  displayName?: string | null;
  bio?: string | null;
  skills?: string[];
  avatarUrl?: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  siteRole: SiteRole;
  createdAt?: string;
  updatedAt?: string;
};

export type BlockedUser = {
  createdAt: string;
  blocked: {
    id: string;
    username: string;
  };
};

export function getCurrentUser() {
  return apiRequest<CurrentUser>(
    "/users/me"
  );
}

export function updateCurrentUser(
  data: {
    username?: string;
    email?: string;
    displayName?: string;
    bio?: string;
    skills?: string[];
  }
) {
  return apiRequest<CurrentUser>(
    "/users/me",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export function getBlockedUsers() {
  return apiRequest<BlockedUser[]>(
    "/users/blocked"
  );
}

export function blockUser(
  userId: string
) {
  return apiRequest(
    `/users/${userId}/block`,
    {
      method: "POST",
    }
  );
}

export function unblockUser(
  userId: string
) {
  return apiRequest(
    `/users/${userId}/block`,
    {
      method: "DELETE",
    }
  );
}

export function getAdminUsers() {
  return apiRequest<AdminUser[]>(
    "/admin/users"
  );
}

export function updateAdminUser(
  userId: string,
  data: {
    username?: string;
    email?: string;
    siteRole?: SiteRole;
  }
) {
  return apiRequest<AdminUser>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export function deleteAdminUser(
  userId: string
) {
  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "DELETE",
    }
  );
}

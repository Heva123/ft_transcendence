import {
  useNavigate,
  useParams,
} from "react-router-dom";

import CommunitiesPage from "../features/communities/pages/CommunitiesPage";
import CommunityDetailsPage from "../features/communities/pages/CommunityDetailsPage";
import CommunityMembersPage from "../features/communities/pages/CommunityMembersPage";
import DiscoverCommunitiesPage from "../features/communities/pages/DiscoverCommunitiesPage";
import RolesPermissionsPage from "../features/communities/pages/RolesPermissionsPage";

function getToken() {
  return localStorage.getItem(
    "accessToken"
  );
}

export function CommunitiesRoute() {
  const navigate =
    useNavigate();

  const token = getToken();

  if (!token) {
    return null;
  }

  return (
    <CommunitiesPage
      token={token}
      onOpenCommunity={(id: string) =>
        navigate(
          `/communities/${id}`
        )
      }
    />
  );
}

export function DiscoverCommunitiesRoute() {
  const token = getToken();

  if (!token) {
    return null;
  }

  return (
    <DiscoverCommunitiesPage />
  );
}

export function CommunityDetailsRoute() {
  const navigate =
    useNavigate();

  const { communityId } =
    useParams();

  const token = getToken();

  if (
    !communityId ||
    !token
  ) {
    return null;
  }

  return (
    <CommunityDetailsPage
      groupId={communityId}
      token={token}
      onBack={() =>
        navigate(
          `/communities/${communityId}`
        )
      }
      onDeleted={() =>
        navigate(
          "/communities"
        )
      }
    />
  );
}

export function CommunityMembersRoute() {
  const navigate =
    useNavigate();

  const { communityId } =
    useParams();

  const token = getToken();

  if (
    !communityId ||
    !token
  ) {
    return null;
  }

  return (
    <CommunityMembersPage
      groupId={communityId}
      token={token}
      onBack={() =>
        navigate(
          `/communities/${communityId}`
        )
      }
    />
  );
}

export function RolesPermissionsRoute() {
  const navigate =
    useNavigate();

  const { communityId } =
    useParams();

  const token = getToken();

  if (
    !communityId ||
    !token
  ) {
    return null;
  }

  return (
    <RolesPermissionsPage
      token={token}
      onBack={() =>
        navigate(
          `/communities/${communityId}`
        )
      }
    />
  );
}
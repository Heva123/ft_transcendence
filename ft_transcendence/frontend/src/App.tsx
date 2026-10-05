import { useEffect, useState } from "react";

import { UserContext, type User } from "./UserContext";

import CommunityMembersPage from "./pages/CommunityMembersPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import DiscoverCommunitiesPage from "./pages/DiscoverCommunitiesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LegalPage from "./pages/LegalPage";
import ProfilePage from "./pages/ProfilePage";

type Page =
  | "login"
  | "register"
  | "dashboard"
  | "profile"
  | "communities"
  | "discover"
  | "members"
  | "terms"
  | "privacy";

type LoginResponse = {
  accessToken: string;
  user: User;
};

function getPageFromHash(): Page {
  const hash = window.location.hash;

  if (hash === "#/register") return "register";
  if (hash === "#/dashboard") return "dashboard";
  if (hash === "#/profile") return "profile";
  if (hash === "#/communities") return "communities";
  if (hash === "#/discover") return "discover";
  if (hash === "#/members") return "members";
  if (hash === "#/terms") return "terms";
  if (hash === "#/privacy") return "privacy";

  return "login";
}

function loadStoredSession(): LoginResponse | null {
  const storedSession =
    sessionStorage.getItem("transcendence-session");

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    sessionStorage.removeItem(
      "transcendence-session"
    );

    return null;
  }
}

function App() {
  const [page, setPage] =
    useState<Page>(getPageFromHash);

  const [session, setSession] =
    useState<LoginResponse | null>(
      loadStoredSession
    );

  const [
  selectedMembersGroupId,
  setSelectedMembersGroupId,
  ] = useState<string | null>(() =>
    sessionStorage.getItem("selected-community-id")
  );

  useEffect(() => {
    function handleHashChange() {
      setPage(getPageFromHash());
    }

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  function navigate(nextPage: Page) {
    window.location.hash = `/${nextPage}`;
    setPage(nextPage);
  }



  function handleLoginSuccess(
    data: LoginResponse
  ) {
    setSession(data);

    sessionStorage.setItem(
      "transcendence-session",
      JSON.stringify(data)
    );

    navigate("dashboard");
  }

  function handleLogout() {
    setSession(null);

    sessionStorage.removeItem(
      "transcendence-session"
    );

    navigate("login");
  }

  function handleUserUpdated(
    updatedUser: User
  ) {
    setSession((currentSession) => {
      if (!currentSession) {
        return null;
      }

      const updatedSession = {
        ...currentSession,
        user: updatedUser,
      };

      sessionStorage.setItem(
        "transcendence-session",
        JSON.stringify(updatedSession)
      );

      return updatedSession;
    });
  }

  function renderPage() {
    if (page === "terms") {
      return (
        <LegalPage
          title="Terms of Service"
          onBack={() => navigate("register")}
        />
      );
    }

    if (page === "privacy") {
      return (
        <LegalPage
          title="Privacy Policy"
          onBack={() => navigate("register")}
        />
      );
    }

    if (page === "profile" && session) {
      return (
        <ProfilePage
          user={session.user}
          token={session.accessToken}
          onUserUpdated={handleUserUpdated}
        />
      );
    }

    if (
      page === "members" &&
      session &&
      selectedMembersGroupId
    ) {
      return (
        <CommunityMembersPage
          groupId={selectedMembersGroupId}
          token={session.accessToken}
          onBack={() => {
            sessionStorage.removeItem(
              "selected-community-id"
            );

            setSelectedMembersGroupId(null);

            navigate("communities");
          }}
        />
      );
    }

    if (page === "discover" && session) {
      return (
        <DiscoverCommunitiesPage
          token={session.accessToken}
        />
      );
    }

    if (page === "communities" && session) {
      return (
        <CommunitiesPage
          token={session.accessToken}
          onOpenMembers={(groupId) => {
            setSelectedMembersGroupId(groupId);

            sessionStorage.setItem(
              "selected-community-id",
              groupId
            );

            navigate("members");
          }}
        />
      );
    }

    if (page === "dashboard" && session) {
      return (
        <DashboardPage
          onBackToLogin={handleLogout}
        />
      );
    }

    if (page === "register") {
      return (
        <RegisterPage
          onSignIn={() =>
            navigate("login")
          }
        />
      );
    }

    return (
      <LoginPage
        onCreateAccount={() =>
          navigate("register")
        }
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );
  }

  return (
    <UserContext.Provider
      value={session?.user ?? null}
    >
      {renderPage()}
    </UserContext.Provider>
  );
}

export default App;
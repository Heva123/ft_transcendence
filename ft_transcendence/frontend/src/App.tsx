import { useEffect, useState } from "react";

import { UserContext, type User } from "./UserContext";

import CommunitiesPage from "./pages/CommunitiesPage";
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
  if (hash === "#/terms") return "terms";
  if (hash === "#/privacy") return "privacy";

  return "login";
}

function App() {
  const [page, setPage] = useState<Page>(getPageFromHash);

  const [session, setSession] =
    useState<LoginResponse | null>(null);

  useEffect(() => {
    function handleHashChange() {
      setPage(getPageFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);

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

  useEffect(() => {
    const isPrivatePage =
      page === "dashboard" ||
      page === "profile" ||
      page === "communities";

    if (isPrivatePage && !session) {
      navigate("login");
    }
  }, [page, session]);

  function handleLoginSuccess(data: LoginResponse) {
    setSession(data);
    navigate("dashboard");
  }

  function handleLogout() {
    setSession(null);
    navigate("login");
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
          onUserUpdated={(updatedUser) => {
            setSession((currentSession) =>
              currentSession
                ? {
                    ...currentSession,
                    user: updatedUser,
                  }
                : null
            );
          }}
        />
      );
    }

    if (page === "communities" && session) {
      return (
        <CommunitiesPage
          token={session.accessToken}
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
          onSignIn={() => navigate("login")}
        />
      );
    }

    return (
      <LoginPage
        onCreateAccount={() => navigate("register")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <UserContext.Provider value={session?.user ?? null}>
      {renderPage()}
    </UserContext.Provider>
  );
}

export default App;
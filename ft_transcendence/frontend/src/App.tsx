import {
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import AppShell from "./layout/AppShell";
import SessionExpiredNotice from "./components/SessionExpiredNotice";

import ChannelPage from "./pages/ChannelPage";
import ChannelsPage from "./pages/ChannelsPage";
import CommunityPage from "./pages/CommunityPage";
import CreatePostPage from "./pages/CreatePostPage";
import FriendsPage from "./pages/FriendsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import PostPage from "./pages/PostPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";

import {
  CommunitiesRoute,
  CommunityDetailsRoute,
  CommunityMembersRoute,
  DiscoverCommunitiesRoute,
  RolesPermissionsRoute,
} from "./routes/CommunityRoutes";

import LegalRoute from "./routes/LegalRoute";
import ProfileRoute from "./routes/ProfileRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./styles/auth.css";
import "./styles/workspace-pages.css";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/communities"
        element={<CommunitiesRoute />}
      />

      <Route
        path="/communities/discover"
        element={
          <DiscoverCommunitiesRoute />
        }
      />

      <Route
        path="/communities/:communityId"
        element={<CommunityPage />}
      />

      <Route
        path="/communities/:communityId/details"
        element={
          <CommunityDetailsRoute />
        }
      />

      <Route
        path="/communities/:communityId/members"
        element={
          <CommunityMembersRoute />
        }
      />

      <Route
        path="/communities/:communityId/roles"
        element={
          <RolesPermissionsRoute />
        }
      />

      <Route
        path="/channels"
        element={<ChannelsPage />}
      />

      <Route
        path="/channels/:channelId"
        element={<ChannelPage />}
      />

      <Route
        path="/friends"
        element={<FriendsPage />}
      />

      <Route
        path="/profile"
        element={<ProfileRoute />}
      />

      <Route
        path="/profile/:username"
        element={<PublicProfilePage />}
      />

      <Route
        path="/posts/new"
        element={<CreatePostPage />}
      />

      <Route
        path="/posts/:postId"
        element={<PostPage />}
      />

      <Route
        path="/notifications"
        element={<NotificationsPage />}
      />

      <Route
        path="/search"
        element={<SearchPage />}
      />

      <Route
        path="/settings"
        element={<SettingsPage />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </ProtectedRoute>
  );
}

function App() {
  const navigate =
    useNavigate();

  function handleLogin(
    data: {
      accessToken: string;
    }
  ) {
    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    navigate("/");
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <>
            <SessionExpiredNotice />
            <LoginPage
              onCreateAccount={() =>
                navigate(
                  "/register"
                )
              }
              onLoginSuccess={
                handleLogin
              }
            />
          </>
        }
      />

      <Route
        path="/register"
        element={
          <RegisterPage
            onSignIn={() =>
              navigate(
                "/login"
              )
            }
          />
        }
      />

      {/* Public legal pages */}
      <Route
        path="/privacy"
        element={
          <LegalRoute
            title="Privacy Policy"
          />
        }
      />

      <Route
        path="/terms"
        element={
          <LegalRoute
            title="Terms of Service"
          />
        }
      />

      {/* Everything else needs login */}
      <Route
        path="/*"
        element={<ProtectedApp />}
      />
    </Routes>
  );
}

export default App;
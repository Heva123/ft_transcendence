import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";
import ProtectedImage from "../components/ProtectedImage";

import {
  apiRequest,
  ApiError,
} from "../api/apiClient";

type SearchUser = {
  id: string;
  username: string;
};

type SearchResponse = {
  results: {
    users: SearchUser[];
  };
};

function PublicProfilePage() {
  const { username } =
    useParams();

  const [person, setPerson] =
    useState<SearchUser | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!username) {
        setError(
          "Profile not found."
        );

        setIsLoading(false);

        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data =
          await apiRequest<SearchResponse>(
            `/search?q=${encodeURIComponent(
              username
            )}&type=users&limit=50`
          );

        const exactMatch =
          data.results.users.find(
            (user) =>
              user.username.toLowerCase() ===
              username.toLowerCase()
          );

        if (!exactMatch) {
          setError(
            "Profile not found."
          );

          return;
        }

        setPerson(exactMatch);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(
            "Could not load profile."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  if (isLoading) {
    return (
      <AppLayout>
        <p
          className="message"
          role="status"
        >
          Loading profile...
        </p>
      </AppLayout>
    );
  }

  if (error || !person) {
    return (
      <AppLayout>
        <h2>
          Profile not found.
        </h2>

        <p className="form-error">
          {error}
        </p>

        <Link
          className="text-link"
          to="/search"
        >
          Find people
        </Link>
      </AppLayout>
    );
  }

  const initials =
    person.username
      .slice(0, 2)
      .toUpperCase();

  return (
    <AppLayout>
      <p className="small-label">
        42 COMMUNITY
      </p>

      <section className="public-profile-header">
        <div className="public-profile-avatar">
          <ProtectedImage
            src={`/uploads/avatar/${person.id}`}
            alt={`${person.username} avatar`}
            className="public-profile-avatar-image"
          />

          <span>
            {initials}
          </span>
        </div>

        <div>
          <h2>
            {person.username}
          </h2>

          <p>
            @{person.username}
          </p>
        </div>
      </section>

      <section className="public-profile-card">
        <h3>
          About this member
        </h3>

        <p>
          Public profile details are
          limited by the current
          backend.
        </p>

        <p>
          Bio, skills, interests and
          friendship actions will
          appear here when those APIs
          are available.
        </p>
      </section>

      <div className="public-profile-actions">
        <Link
          className="community-primary-button"
          to="/search"
        >
          Find more people
        </Link>
      </div>
    </AppLayout>
  );
}

export default PublicProfilePage;
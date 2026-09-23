import { useState, type FormEvent } from "react";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import Input from "../components/Input";

type ProfileUser = {
  id: string;
  email: string;
  username: string;
};

type ProfilePageProps = {
  user: ProfileUser;
  token: string;
  onUserUpdated: (user: ProfileUser) => void;
};

function ProfilePage({
  user,
  token,
  onUserUpdated,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleCancel() {
    setUsername(user.username);
    setEmail(user.email);
    setError("");
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setError("");
    setMessage("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!usernamePattern.test(cleanUsername)) {
      setError(
        "Username must be 3-30 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      cleanUsername === user.username &&
      cleanEmail === user.email
    ) {
      setMessage("No changes to save.");
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/users/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: cleanUsername,
            email: cleanEmail,
          }),
        }
      );

      if (response.status === 401) {
        setError(
          "Your session has expired. Please sign out and sign in again."
        );
        return;
      }

      if (response.status === 409) {
        setError(
          "This username or email is already in use."
        );
        return;
      }

      if (response.status === 400) {
        setError(
          "Please check your username and email."
        );
        return;
      }

      if (!response.ok) {
        setError("Could not update your profile.");
        return;
      }

      const updatedUser: ProfileUser = await response.json();

      // Tell App.tsx about the updated account information.
      onUserUpdated(updatedUser);

      setUsername(updatedUser.username);
      setEmail(updatedUser.email);

      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch {
      setError(
        "Could not connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout>
      <p className="small-label">MY PROFILE</p>

      <h2>Student Profile</h2>

      <div className="dashboard-card">
        {!isEditing ? (
          <>
            <h3>{user.username}</h3>

            <p>@{user.username}</p>

            <h3>Email address</h3>

            <p>{user.email}</p>

            <button
              type="button"
              className="text-link"
              onClick={() => {
                setError("");
                setMessage("");
                setIsEditing(true);
              }}
            >
              Edit profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} noValidate>
            <h3>Edit profile</h3>

            <Input
              id="profile-username"
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={setUsername}
              required
            />

            <Input
            id="profile-email"
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
            required
          />

            <Button
              text={
                isLoading
                  ? "Saving..."
                  : "Save changes"
              }
            />

            <button
              type="button"
              className="text-link"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </form>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </div>
    </AppLayout>
  );
}

export default ProfilePage;
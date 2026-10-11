import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

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
  const [isEditing, setIsEditing] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [username, setUsername] =
    useState(user.username);

  const [email, setEmail] =
    useState(user.email);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] =
    useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function handleCancel() {
    setUsername(user.username);
    setEmail(user.email);
    setError("");
    setIsEditing(false);
  }

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please choose a PNG or JPEG image."
      );
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Avatar image must be smaller than 5 MB."
      );
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(preview);

    setMessage(
      "Avatar selected. Backend upload will be connected later."
    );
  }

  function removeAvatarPreview() {
    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setMessage("");
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isLoading) return;

    setError("");
    setMessage("");

    const cleanUsername =
      username.trim();

    const cleanEmail =
      email.trim();

    const usernamePattern =
      /^[a-zA-Z0-9_]{3,30}$/;

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !usernamePattern.test(
        cleanUsername
      )
    ) {
      setError(
        "Username must be 3-30 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      cleanUsername === user.username &&
      cleanEmail === user.email
    ) {
      setMessage(
        "No profile changes to save."
      );

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
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            username:
              cleanUsername,
            email:
              cleanEmail,
          }),
        }
      );

      if (response.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
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
        setError(
          "Could not update your profile."
        );
        return;
      }

      const updatedUser:
        ProfileUser =
        await response.json();

      onUserUpdated(updatedUser);

      setUsername(
        updatedUser.username
      );

      setEmail(
        updatedUser.email
      );

      setIsEditing(false);

      setMessage(
        "Profile updated successfully!"
      );
    } catch {
      setError(
        "Could not connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout>
      <p className="small-label">
        MY PROFILE
      </p>

      <h2>A little more you.</h2>

      <p className="profile-subtitle">
        Make a little change. Keep building.
      </p>

      <section className="profile-hero">
        <div className="profile-avatar">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile preview"
            />
          ) : (
            user.username
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div className="profile-identity">
          <h3>{user.username}</h3>

          <p>
            @{user.username}
          </p>

          <p>{user.email}</p>
        </div>

        <button
          type="button"
          className="profile-edit-button"
          onClick={() => {
            setError("");
            setMessage("");
            setIsEditing(true);
          }}
        >
          Edit profile
        </button>
      </section>

      <div className="profile-grid">
        <section className="profile-card">
          <h3>Profile details</h3>

          {!isEditing ? (
            <>
              <p>
                <strong>
                  Display name
                </strong>
              </p>

              <p>
                {user.username}
              </p>

              <p>
                <strong>
                  Email
                </strong>
              </p>

              <p>
                {user.email}
              </p>
            </>
          ) : (
            <form
              onSubmit={handleSave}
              noValidate
            >
              <Input
                id="profile-username"
                label="Display name"
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
                onClick={
                  handleCancel
                }
                disabled={
                  isLoading
                }
              >
                Cancel
              </button>
            </form>
          )}
        </section>

        <section className="profile-card">
          <h3>
            A face for your profile.
          </h3>

          <p className="profile-upload-help">
            PNG or JPEG · maximum 5 MB
          </p>

          <label
            className="avatar-upload-button"
            htmlFor="avatar-file"
          >
            Choose your image
          </label>

          <input
            id="avatar-file"
            className="avatar-file-input"
            type="file"
            accept="image/png,image/jpeg"
            onChange={
              handleAvatarChange
            }
          />

          {avatarFile && (
            <div className="avatar-file-info">
              <p>
                {avatarFile.name}
              </p>

              <p>
                {(
                  avatarFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>

              <button
                type="button"
                className="text-link"
                onClick={
                  removeAvatarPreview
                }
              >
                Remove / Cancel
              </button>
            </div>
          )}
        </section>
      </div>

      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          className="message"
          role="status"
        >
          {message}
        </p>
      )}
    </AppLayout>
  );
}

export default ProfilePage;
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import Input from "../components/Input";
import {
  apiBlob,
  apiRequest,
  ApiError,
  uploadRequest,
} from "../api/apiClient";

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

type AvatarUploadResponse = {
  id: string;
  username: string;
  avatarUrl: string;
};



function ProfilePage({
  user,
  onUserUpdated,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

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

  const [savedAvatarUrl, setSavedAvatarUrl] =
    useState<string | null>(null);

  const [avatarVersion, setAvatarVersion] =
    useState(0);

  // Load saved avatar from backend.
  useEffect(() => {
    let active = true;
    let objectUrl = "";

    async function loadAvatar() {
      try {
        const blob = await apiBlob(
          `/uploads/avatar/${user.id}`
        );

        if (!active) {
          return;
        }

        objectUrl =
          URL.createObjectURL(blob);

        setSavedAvatarUrl(objectUrl);
      } catch {
        if (active) {
          setSavedAvatarUrl(null);
        }
      }
    }

    loadAvatar();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [user.id, avatarVersion]);

  // Clean temporary preview URLs.
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(
          avatarPreview
        );
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
    setUploadProgress(0);

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please choose a PNG, JPEG, or WEBP image."
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
      "Avatar selected. Press Upload avatar to save it."
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
    setUploadProgress(0);
    setMessage("");
  }

  async function handleUploadAvatar() {
    if (
      !avatarFile ||
      isUploading
    ) {
      return;
    }

    setError("");
    setMessage("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadRequest<AvatarUploadResponse>(
        "/uploads/avatar",
        avatarFile,
        setUploadProgress
      );

      if (avatarPreview) {
        URL.revokeObjectURL(
          avatarPreview
        );
      }

      setAvatarFile(null);
      setAvatarPreview(null);

      // Reload saved avatar from backend.
      setAvatarVersion(
        (current) => current + 1
      );

      setMessage(
        "Avatar updated successfully!"
      );
    } catch {
      setError(
        "Could not upload avatar."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteAvatar() {
  if (isUploading) {
    return;
  }

  setError("");
  setMessage("");

  try {
    await apiRequest(
      "/uploads/avatar",
      {
        method: "DELETE",
      }
    );

    setSavedAvatarUrl(null);

    setAvatarVersion(
      (current) => current + 1
    );

    setMessage(
      "Avatar removed successfully."
    );
  } catch (err) {
    if (
      err instanceof ApiError &&
      err.status === 401
    ) {
      setError(
        "Your session has expired. Please sign in again."
      );
    } else {
      setError(
        "Could not remove avatar."
      );
    }
  }
}

  async function handleSave(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (isLoading) {
    return;
  }

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
    cleanUsername ===
      user.username &&
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
    const updatedUser =
      await apiRequest<ProfileUser>(
        "/users/me",
        {
          method: "PATCH",

          body: JSON.stringify({
            username:
              cleanUsername,

            email:
              cleanEmail,
          }),
        }
      );

    onUserUpdated(
      updatedUser
    );

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
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (
        err.status === 409
      ) {
        setError(
          "This username or email is already in use."
        );
      } else if (
        err.status === 400
      ) {
        setError(
          "Please check your username and email."
        );
      } else {
        setError(err.message);
      }
    } else {
      setError(
        "Could not update your profile."
      );
    }
  } finally {
    setIsLoading(false);
  }
}

  const avatarToShow =
    avatarPreview ||
    savedAvatarUrl;

  return (
    <AppLayout>
      <p className="small-label">
        MY PROFILE
      </p>

      <h2>
        A little more you.
      </h2>

      <p className="profile-subtitle">
        Make a little change.
        Keep building.
      </p>

      <section className="profile-hero">
        <div className="profile-avatar">
          {avatarToShow ? (
            <img
              src={avatarToShow}
              alt={`${user.username}'s avatar`}
            />
          ) : (
            user.username
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div className="profile-identity">
          <h3>
            {user.username}
          </h3>

          <p>
            @{user.username}
          </p>

          <p>
            {user.email}
          </p>
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
          <h3>
            Profile details
          </h3>

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
            PNG, JPEG or WEBP ·
            maximum 5 MB
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
            accept="image/png,image/jpeg,image/webp"
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

              {isUploading && (
                <p>
                  Uploading...{" "}
                  {uploadProgress}%
                </p>
              )}

              <button
                type="button"
                className="profile-edit-button"
                onClick={
                  handleUploadAvatar
                }
                disabled={
                  isUploading
                }
              >
                {isUploading
                  ? "Uploading..."
                  : "Upload avatar"}
              </button>

              <button
                type="button"
                className="text-link"
                onClick={
                  removeAvatarPreview
                }
                disabled={
                  isUploading
                }
              >
                Cancel
              </button>
            </div>
          )}

          {!avatarFile &&
            savedAvatarUrl && (
              <div className="avatar-file-info">
                <p>
                  Your avatar is
                  saved.
                </p>

                <button
                  type="button"
                  className="text-link"
                  onClick={
                    handleDeleteAvatar
                  }
                >
                  Remove avatar
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
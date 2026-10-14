import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import AppLayout from "../components/AppLayout";

import {
  apiRequest,
  ApiError,
} from "../api/apiClient";

type GroupDetails = {
  id: string;
  name: string;
  description: string | null;

  members: {
    role: string;
  }[];
};

type CommunityDetailsPageProps = {
  groupId: string;
  token: string;
  onBack: () => void;
  onDeleted: () => void;
};

function CommunityDetailsPage({
  groupId,
  token: _token,
  onBack,
  onDeleted,
}: CommunityDetailsPageProps) {
  const [group, setGroup] =
    useState<GroupDetails | null>(
      null
    );

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadCommunity() {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await apiRequest<GroupDetails>(
            `/communities/${groupId}`
          );

        setGroup(data);
        setName(data.name);

        setDescription(
          data.description || ""
        );
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(
            "Could not load community."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCommunity();
  }, [groupId]);

  const role =
    group?.members[0]
      ?.role || "MEMBER";

  const canEdit =
    role === "OWNER" ||
    role === "ADMIN";

  const canDelete =
    role === "OWNER";

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      isSaving ||
      !canEdit
    ) {
      return;
    }

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();

    setError("");
    setMessage("");

    if (
      cleanName.length < 2 ||
      cleanName.length > 100
    ) {
      setError(
        "Community name must contain 2-100 characters."
      );

      return;
    }

    if (
      cleanDescription.length >
      500
    ) {
      setError(
        "Description cannot exceed 500 characters."
      );

      return;
    }

    setIsSaving(true);

    try {
      const updated =
        await apiRequest<GroupDetails>(
          `/communities/${groupId}`,
          {
            method: "PATCH",

            body: JSON.stringify({
              name: cleanName,

              description:
                cleanDescription ||
                undefined,
            }),
          }
        );

      setGroup((current) =>
        current
          ? {
              ...current,
              ...updated,
            }
          : updated
      );

      setName(updated.name);

      setDescription(
        updated.description ||
          ""
      );

      setMessage(
        "Community updated successfully!"
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Could not update community."
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !canDelete ||
      isDeleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${group?.name}?\n\nAll channels, community posts and memberships will be removed.`
      );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        `/communities/${groupId}`,
        {
          method: "DELETE",
        }
      );

      onDeleted();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Could not delete community."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AppLayout>
      <button
        type="button"
        className="text-link"
        onClick={onBack}
      >
        ← Back to community
      </button>

      <p className="small-label">
        MANAGE COMMUNITY
      </p>

      <h2>
        Make it your own.
      </h2>

      <p className="community-form-subtitle">
        Make a little change.
        Keep building.
      </p>

      {isLoading && (
        <p
          className="message"
          role="status"
        >
          Loading community...
        </p>
      )}

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

      {!isLoading &&
        group &&
        !canEdit && (
          <div className="dashboard-card">
            <h3>
              You don't have
              permission here.
            </h3>

            <p>
              Only community
              admins and owners can
              manage these settings.
            </p>
          </div>
        )}

      {!isLoading &&
        group &&
        canEdit && (
          <form
            className="community-form-card"
            onSubmit={
              handleSave
            }
          >
            <label
              className="community-form-field"
              htmlFor="manage-community-name"
            >
              <span>
                Community name
              </span>

              <input
                id="manage-community-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                maxLength={100}
                required
              />
            </label>

            <label
              className="community-form-field"
              htmlFor="manage-community-description"
            >
              <span>
                Description
              </span>

              <textarea
                id="manage-community-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={5}
                maxLength={500}
              />
            </label>

            <div className="community-form-actions">
              <button
                type="submit"
                className="community-primary-button"
                disabled={
                  isSaving ||
                  isDeleting
                }
              >
                {isSaving
                  ? "Saving..."
                  : "Save changes"}
              </button>

              {canDelete && (
                <button
                  type="button"
                  className="community-delete-button"
                  disabled={
                    isDeleting ||
                    isSaving
                  }
                  onClick={
                    handleDelete
                  }
                >
                  {isDeleting
                    ? "Deleting..."
                    : "Delete community"}
                </button>
              )}
            </div>
          </form>
        )}
    </AppLayout>
  );
}

export default CommunityDetailsPage;
import { useEffect, useState } from "react";

import AppLayout from "../components/AppLayout";

type Member = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type CommunityMembersPageProps = {
  groupId: string;
  token: string;
  onBack: () => void;
};

function CommunityMembersPage({
  groupId,
  token,
  onBack,
}: CommunityMembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:3000/api/communities/${groupId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load community members."
          );
        }

        const data: Member[] = await response.json();

        setMembers(data);

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMembers();

  }, [groupId, token]);


  return (
    <AppLayout>

      <button
        type="button"
        className="text-link"
        onClick={onBack}
      >
        ← Back to Community
      </button>


      <p className="small-label">
        MEMBERS
      </p>


      <h2>
        Community Members
      </h2>


      {isLoading && (
        <p className="message">
          Loading members...
        </p>
      )}


      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      {!isLoading &&
        !error &&
        members.map((member) => (
          <div
            className="dashboard-card"
            key={member.id}
          >

            <h3>
              {member.username}
            </h3>

            <p>
              {member.email}
            </p>

            <p>
              Role: {member.role}
            </p>

          </div>
        ))
      }


      {!isLoading &&
        !error &&
        members.length === 0 && (
          <div className="dashboard-card">
            <p>
              No members found.
            </p>
          </div>
        )}

    </AppLayout>
  );
}

export default CommunityMembersPage;
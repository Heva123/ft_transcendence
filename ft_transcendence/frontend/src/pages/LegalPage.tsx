
type LegalPageProps = {
  title: string;
  onBack: () => void;
};

function LegalPage({
  title,
  onBack,
}: LegalPageProps) {
  const isPrivacy =
    title === "Privacy Policy";

  return (
    <div className="dashboard-page">
      <main className="dashboard-main legal-page">

        <p className="small-label">
          PXL_LAB / LEGAL
        </p>

        <h1>{title}</h1>

        <p className="legal-subtitle">
          Product copy draft — final policy
          requires the team's deployment details.
        </p>

        <section className="legal-card">

          {isPrivacy ? (
            <>
              <h2>
                Your data in PXL_LAB
              </h2>

              <p>
                PXL_LAB uses your account details,
                profile, community memberships,
                posts and messages to provide the
                community experience.
              </p>

              <p>
                Your posts are visible according to
                their selected audience. Community
                messages are available to members
                who have access to that channel.
              </p>

              <h2>
                Access and account controls
              </h2>

              <p>
                You can edit your profile and avatar,
                manage friendships, block users and
                choose notification preferences.
              </p>

              <h2>
                Draft status
              </h2>

              <p>
                This is a designed policy screen with
                draft content, not an approved legal
                policy. Replace the draft before
                deployment.
              </p>
            </>
          ) : (
            <>
              <h2>
                Using this community
              </h2>

              <p>
                PXL_LAB is a learning community.
                Treat other members respectfully,
                share only content you have
                permission to share, and avoid
                posting personal or sensitive
                information about others.
              </p>

              <h2>
                Community moderation
              </h2>

              <p>
                Community owners, admins and
                moderators have different
                permissions. Report content that
                breaks community rules.
              </p>

              <h2>
                Draft status
              </h2>

              <p>
                This is a designed policy screen with
                draft content, not an approved legal
                policy. Replace the draft before
                deployment.
              </p>
            </>
          )}

        </section>

        <button
          type="button"
          className="dashboard-back"
          onClick={onBack}
        >
          Back
        </button>

      </main>
    </div>
  );
}

export default LegalPage;
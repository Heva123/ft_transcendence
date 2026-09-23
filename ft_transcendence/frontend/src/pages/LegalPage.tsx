type LegalPageProps = 
{
  title: string;
  onBack: () => void;
};

function LegalPage({ title, onBack }: LegalPageProps) {
  return (
    <div className="dashboard-page">
      <main className="dashboard-main legal-page">
        <p className="small-label">PXL_LAB / LEGAL</p>

        <h1>{title}</h1>

        <div className="dashboard-card">
          <p className="small-label">
            DRAFT — NOT FOR PUBLICATION
          </p>

          <p>
            The final content for this page is pending
            review and approval by the project team.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-back"
          onClick={onBack}
        >
          Back to registration
        </button>
      </main>
    </div>
  );
}

export default LegalPage;
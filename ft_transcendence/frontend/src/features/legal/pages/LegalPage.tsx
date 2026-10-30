import {
  LEGAL_UPDATED,
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
} from "../utils/legalContent";


type LegalPageProps = {
  title: string;
  onBack: () => void;
};

function LegalPage({
  title,
  onBack,
}: LegalPageProps) {
  const sections =
    title === "Privacy Policy"
      ? PRIVACY_POLICY
      : TERMS_OF_SERVICE;

  return (
    <div className="dashboard-page">
      <main className="dashboard-main legal-page">

        <p className="small-label">
          PXL_LAB / LEGAL
        </p>

        <h1>{title}</h1>

        <p className="legal-subtitle">
          Last updated {LEGAL_UPDATED} ·
          PXL_LAB, a 42 Abu Dhabi student
          project.
        </p>

        <section className="legal-card">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          ))}
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
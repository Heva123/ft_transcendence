import AppLayout from "../components/AppLayout";

type DashboardPageProps = {
  onBackToLogin: () => void;
};

function DashboardPage({ onBackToLogin }: DashboardPageProps) {
  return (
    <AppLayout>
      <p className="small-label">
        DASHBOARD PREVIEW
      </p>

      <h2>Welcome to PXL_LAB.</h2>

      <p>Your campus, connected.</p>

      <div className="dashboard-card">
        Your dashboard content will appear here.
      </div>

      <button
        type="button"
        className="dashboard-back"
        onClick={onBackToLogin}
      >
        Back to login
      </button>
    </AppLayout>
  );
}

export default DashboardPage;
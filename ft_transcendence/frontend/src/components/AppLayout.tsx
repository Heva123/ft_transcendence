import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="dashboard-main">
      {children}
    </div>
  );
}

export default AppLayout;

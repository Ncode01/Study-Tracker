import { useState } from "react";
import { Layout } from "./components";
import { DashboardPage } from "./pages";
import type { ViewName } from "./types";
import "./styles/global.css";

function App(): React.ReactElement {
  const [currentView, setCurrentView] = useState<ViewName>("dashboard");

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <DashboardPage />
    </Layout>
  );
}

export default App;
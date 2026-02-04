import { useState } from "react";
import { Layout } from "./components";
import { DashboardPage, CalendarPage, TasksPage, ProgressPage, TimerPage } from "./pages";
import type { ViewName } from "./types";
import "./styles/global.css";

function App(): React.ReactElement {
  const [currentView, setCurrentView] = useState<ViewName>("dashboard");

  const renderPage = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage />;
      case "calendar":
        return <CalendarPage />;
      case "tasks":
        return <TasksPage />;
      case "progress":
        return <ProgressPage />;
      case "timer":
        return <TimerPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderPage()}
    </Layout>
  );
}

export default App;
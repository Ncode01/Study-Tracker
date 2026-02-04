import { useState } from "react";
import { Layout } from "./components";
import { DashboardPage, CalendarPage, TasksPage, ProgressPage, TimerPage } from "./pages";
import FlashcardsPage from "./pages/FlashcardsPage";
import type { ViewName } from "./types";
import { ToastProvider } from "./components/ui/Toast";
import { AnimatedBackground } from "./components/ui/AnimatedBackground";
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
      case "flashcards":
        return <FlashcardsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ToastProvider>
      <AnimatedBackground />
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {renderPage()}
      </Layout>
    </ToastProvider>
  );
}

export default App;
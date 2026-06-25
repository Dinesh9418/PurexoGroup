import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MessProvider, useMessContext } from "./context/MessContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./components/dashboard/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import BiometricPage from "./pages/BiometricPage";
import PaymentsPage from "./pages/PaymentsPage";
import LoginPage from "./components/auth/LoginPage";
import "./assets/styles/global.css";
import "./App.css";

function AppContent() {
  const { activeTab } = useMessContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = {
    dashboard: <DashboardPage />,
    students: <StudentsPage />,
    payments: <PaymentsPage />,
    biometric: <BiometricPage />,
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={closeSidebar} />
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />
      <div className="app-main">
        <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main style={{ flex: 1, overflow: "auto" }}>
          {pages[activeTab] || <DashboardPage />}
        </main>
      </div>
    </div>
  );
}

function AuthGate() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF8",
          fontFamily: "var(--font-main)",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        <span className="loader"></span>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <MessProvider>
      <AppContent />
    </MessProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

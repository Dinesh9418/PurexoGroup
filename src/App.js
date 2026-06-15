import React from "react";
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

function AppContent() {
  const { activeTab } = useMessContext();

  const pages = {
    dashboard: <DashboardPage />,
    students: <StudentsPage />,
    biometric: <BiometricPage />,
    payments: <PaymentsPage />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAF8" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: 220,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
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
        Loading…
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

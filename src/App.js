import React from "react";
import { MessProvider, useMessContext } from "./context/MessContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./components/dashboard/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import BiometricPage from "./pages/BiometricPage";
import PaymentsPage from "./pages/PaymentsPage";
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

export default function App() {
  return (
    <MessProvider>
      <AppContent />
    </MessProvider>
  );
}

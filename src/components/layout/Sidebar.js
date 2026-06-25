import React from "react";
import { useMessContext } from "../../context/MessContext";

const navItems = [
  { key: "dashboard", icon: "⊞", label: "Dashboard" },
  { key: "students", icon: "◎", label: "Students & IDs" },
  { key: "biometric", icon: "❋", label: "Biometric" },
  { key: "payments", icon: "₹", label: "Payments" },
];

export default function Sidebar({ open, onNavigate }) {
  const { activeTab, setActiveTab } = useMessContext();

  const handleSelect = (key) => {
    setActiveTab(key);
    if (onNavigate) onNavigate();
  };

  return (
    <aside
      className={`sidebar ${open ? "open" : ""}`}
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#FFFFFF",
        borderRight: "1px solid rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div style={{ padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#1D9E75",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            🍽
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1917" }}>
              MessTracker
            </div>
            <div style={{ fontSize: 11, color: "#9E9C97" }}>
              Student mess portal
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 10px", flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleSelect(item.key)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              background: activeTab === item.key ? "#E1F5EE" : "transparent",
              color: activeTab === item.key ? "#0F6E56" : "#6B6860",
              fontSize: 13,
              fontWeight: activeTab === item.key ? 500 : 400,
              cursor: "pointer",
              marginBottom: 2,
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div style={{ fontSize: 11, color: "#9E9C97" }}>May 2026 session</div>
        <div
          style={{
            fontSize: 12,
            color: "#1A1917",
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          Active
        </div>
      </div>
    </aside>
  );
}

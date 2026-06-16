import React, { useState } from "react";
import { useMessContext } from "../context/MessContext";
import StudentCard from "../components/students/StudentCard";
import StudentDetail from "../components/students/StudentDetail";
import AddStudentModal from "../components/students/AddStudentModal";
import Button from "../components/common/Button";

const FILTERS = ["All", "Paid", "Pending", "Expiring soon", "No biometric"];

export default function StudentsPage() {
  const { students, getDaysLeft } = useMessContext();
  const [selected, setSelected] = useState(students[0]?.id || null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search);
    const matchFilter =
      filter === "All"
        ? true
        : filter === "Paid"
          ? s.paid
          : filter === "Pending"
            ? !s.paid
            : filter === "Expiring soon"
              ? getDaysLeft(s.endDate) <= 7
              : filter === "No biometric"
                ? !s.bioRegistered
                : true;
    return matchSearch && matchFilter;
  });
  const selectedStudent = students.find((s) => s.id === selected);

  return (
    <div
      style={{
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 7,
                border: "1px solid",
                borderColor: filter === f ? "#1D9E75" : "rgba(0,0,0,0.09)",
                background: filter === f ? "#E1F5EE" : "transparent",
                color: filter === f ? "#0F6E56" : "#6B6860",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or ID…"
          style={{
            padding: "7px 12px",
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.1)",
            background: "#F3F2EF",
            outline: "none",
            width: 180,
          }}
        />
        <Button variant="dark" onClick={() => setShowAdd(true)}>
          + Add student
        </Button>
      </div>

      {/* Body */}
      <div style={{ display: "flex", gap: 16, flex: 1, overflow: "hidden" }}>
        {/* Grid */}
        <div
          style={{
            width: 360,
            flexShrink: 0,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            alignContent: "start",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                color: "#9E9C97",
                fontSize: 13,
                padding: 40,
              }}
            >
              No students found
            </div>
          ) : (
            filtered.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                selected={s.id === selected}
                onClick={() => setSelected(s.id)}
              />
            ))
          )}
        </div>
        {/* Detail */}
        <StudentDetail student={selectedStudent} />
      </div>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

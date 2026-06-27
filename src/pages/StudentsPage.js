import React, { useState } from "react";
import { useMessContext } from "../context/MessContext";
import StudentCard from "../components/students/StudentCard";
import StudentDetail from "../components/students/StudentDetail";
import AddStudentModal from "../components/students/AddStudentModal";
import Button from "../components/common/Button";

const FILTERS = [
  "All", "Active", "Paid", "Pending",
  "Expiring soon", "Expired", "No biometric", "Inactive",
];

export default function StudentsPage() {
  const { students, getDaysLeft, getPaymentStatus, isActive } = useMessContext();

  // ── Use _docId (Firestore doc ID) as the unique selector key ──
  // Falls back to s.id for local/demo data that has no _docId
  const getKey = (s) => s._docId || s.id;

  const [selectedKey, setSelectedKey] = useState(null);
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [showAdd,     setShowAdd]     = useState(false);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.id  || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.userID || "").toLowerCase().includes(search.toLowerCase());

    const active   = isActive ? isActive(s) : s.status !== "inactive";
    const daysLeft = getDaysLeft(s.endDate);
    const payStatus = getPaymentStatus(s);

    const matchFilter =
      filter === "All"          ? true :
      filter === "Active"       ? active :
      filter === "Paid"         ? active && payStatus === "paid" :
      filter === "Pending"      ? active && payStatus !== "paid" :
      filter === "Expiring soon"? active && daysLeft <= 7 && daysLeft > 0 :
      filter === "Expired"      ? active && daysLeft <= 0 :
      filter === "No biometric" ? active && !s.bioRegistered :
      filter === "Inactive"     ? !active : true;

    return matchSearch && matchFilter;
  });

  // Find selected student by its unique Firestore _docId (or fallback id)
  const selectedStudent = students.find((s) => getKey(s) === selectedKey) || null;

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 500,
              borderRadius: 7, border: "1px solid",
              borderColor: filter === f ? "#1D9E75" : "rgba(0,0,0,0.09)",
              background:  filter === f ? "#E1F5EE" : "transparent",
              color:       filter === f ? "#0F6E56" : "#6B6860",
              cursor: "pointer",
            }}>{f}</button>
          ))}
        </div>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or ID…"
          style={{
            padding: "7px 12px", fontSize: 12, borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.1)", background: "#F3F2EF",
            outline: "none", width: 180, flexShrink: 0,
          }}
        />
        <Button variant="dark" onClick={() => setShowAdd(true)}>+ Add student</Button>
      </div>

      {/* Body */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

        {/* Card grid — keyed and selected by _docId */}
        <div style={{
          width: 450, flexShrink: 0,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, alignContent: "start",
          maxHeight: "70vh", overflowY: "auto",
        }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#9E9C97", fontSize: 13, padding: 40 }}>
              No students found
            </div>
          ) : filtered.map((s) => {
            const key = getKey(s);
            return (
              <StudentCard
                key={key}                        // ← unique React key = _docId
                student={s}
                selected={key === selectedKey}   // ← compare by _docId
                onClick={() => setSelectedKey(key)}
              />
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <StudentDetail student={selectedStudent} />
        </div>
      </div>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

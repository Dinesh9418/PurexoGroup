import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useMessContext } from "../../context/MessContext";
import { formatDate } from "../../utils/helpers";

const toStr = (d) => d.toISOString().split("T")[0];
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export default function AddStudentModal({ onClose }) {
  const { addStudent } = useMessContext();
  const todayStr = toStr(new Date());
  const endStr = toStr(addDays(new Date(), 30));

  const [form, setForm] = useState({
    name: "",
    userID: "",
    plan: "both",
    phone: "",
    email: "",
    startDate: todayStr,
    endDate: endStr, // auto-calculated, shown read-only
  });

  const set = (k, v) => {
    if (k === "startDate") {
      // whenever start changes, auto-set end = start + 30 days
      const newEnd = toStr(addDays(new Date(v), 30));
      setForm((p) => ({ ...p, startDate: v, endDate: newEnd }));
    } else {
      setForm((p) => ({ ...p, [k]: v }));
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 8,
    outline: "none",
    background: "#FAFAF8",
    color: "#1A1917",
  };
  const readOnlyStyle = {
    ...inputStyle,
    background: "#F3F2EF",
    color: "#6B6860",
    cursor: "not-allowed",
  };
  const labelStyle = {
    fontSize: 12,
    color: "#6B6860",
    marginBottom: 5,
    display: "block",
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Student name is required");
      return;
    }
    addStudent(form);
    onClose();
    // alert("User added successfully");
  };

  const [showAdd, setShowAdd] = useState(false);
  return (
    <>
      <Modal title="Add new student" onClose={onClose}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Arjun Rane"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Meal plan *</label>
            <select
              style={inputStyle}
              value={form.plan}
              onChange={(e) => set("plan", e.target.value)}
            >
              <option value="both">Lunch + Dinner — ₹3,200 / month</option>
              <option value="lunch">Lunch only — ₹1,800 / month</option>
              <option value="dinner">Dinner only — ₹1,800 / month</option>
            </select>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="9876543210"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="student@email.com"
              />
            </div>
          </div>

          {/* Date row */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Start date</label>
              <input
                type="date"
                style={inputStyle}
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                End date
                <span
                  style={{
                    fontSize: 10,
                    color: "#1D9E75",
                    marginLeft: 6,
                    fontWeight: 500,
                  }}
                >
                  auto (start + 30 days)
                </span>
              </label>
              <input
                type="date"
                style={readOnlyStyle}
                value={form.endDate}
                readOnly
              />
            </div>
          </div>

          {/* Date preview */}
          <div
            style={{
              background: "#E1F5EE",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "#0F6E56",
            }}
          >
            📅 Mess period: <strong>{formatDate(form.startDate)}</strong> →{" "}
            <strong>{formatDate(form.endDate)}</strong> (30 days)
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 4,
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                handleSubmit();
                setShowAdd(true);
              }}
            >
              Add student
            </Button>
          </div>
        </div>
      </Modal>

      {showAdd && (
        <Modal title="Add new student" onClose={onClose}>
          <div style={{ display: "grid", gap: 14 }}>
            <p>{form.name}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>
                Add student
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

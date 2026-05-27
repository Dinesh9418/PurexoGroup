import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useMessContext } from "../../context/MessContext";

export default function AddStudentModal({ onClose }) {
  const { addStudent } = useMessContext();
  const [form, setForm] = useState({
    name: "",
    address: "",
    plan: "both",
    phone: "",
    email: "",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
  });

  //const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const set = (k, v) => {
    if (k === "startDate") {
      const start = new Date(v);
      const end = new Date(start);
      end.setDate(start.getDate() + 30); // add 30 days
      setForm((p) => ({
        ...p,
        startDate: v,
        endDate: end.toISOString().split("T")[0],
      }));
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
  const labelStyle = {
    fontSize: 12,
    color: "#6B6860",
    marginBottom: 5,
    display: "block",
  };

  const handleSubmit = () => {
    if (!form.name || !form.address)
      return alert("Name and address are required");
    addStudent(form);
    onClose();
  };

  return (
    <Modal title="Add new student" onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>Full name *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Arjun Rane"
            />
          </div>
          <div>
            <label style={labelStyle}>Address *</label>
            <input
              style={inputStyle}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="e.g. Room 12"
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
            <option value="both">Lunch + Dinner — ₹3,200/month</option>
            <option value="lunch">Lunch only — ₹1,800/month</option>
            <option value="dinner">Dinner only — ₹1,800/month</option>
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
            <label style={labelStyle}>End date</label>
            <input
              type="date"
              style={inputStyle}
              value={form.endDate}
              // readOnly
              onChange={(e) => set("endDate", e.target.value)}
            />
            {/* <input
              type="date"
              style={inputStyle}
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            /> */}
          </div>
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
          <Button variant="primary" onClick={handleSubmit}>
            Add student
          </Button>
        </div>
      </div>
    </Modal>
  );
}

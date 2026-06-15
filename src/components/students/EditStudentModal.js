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

export default function EditStudentModal({ student, onClose }) {
  const { updateStudent } = useMessContext();

  const [form, setForm] = useState({
    name: student.name,
    userID: student.id,
    plan: student.plan,
    phone: student.phone || "",
    email: student.email || "",
    startDate: student.startDate,
    endDate: student.endDate,
  });
  console.log("Initial form state:", form);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    if (k === "startDate") {
      const newEnd = toStr(addDays(new Date(v), 30));
      setForm((p) => ({ ...p, startDate: v, endDate: newEnd }));
    } else {
      setForm((p) => ({ ...p, [k]: v }));
    }
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.userID.trim()) e.userID = "User ID is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    updateStudent(student.id, form);
    onClose();
  };

  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    border: `1px solid ${hasErr ? "#E24B4A" : "rgba(0,0,0,0.12)"}`,
    borderRadius: 8,
    outline: "none",
    background: "#FAFAF8",
    color: "#1A1917",
    transition: "border-color 0.15s",
  });

  const readOnlyStyle = {
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 8,
    outline: "none",
    background: "#F3F2EF",
    color: "#6B6860",
    cursor: "not-allowed",
  };

  const labelStyle = {
    fontSize: 12,
    color: "#6B6860",
    marginBottom: 5,
    display: "block",
    fontWeight: 500,
  };

  return (
    <Modal title={`Edit — ${student.name}`} onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        {/* Student ID (read-only) */}
        <div
          style={{
            background: "#F3F2EF",
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "#6B6860" }}>Student ID</span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 600,
              color: "#1A1917",
            }}
          >
            {student.id}
          </span>
        </div>

        {/* Name + USer ID */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>Full name *</label>
            <input
              style={inputStyle(errors.name)}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Arjun Rane"
            />
            {errors.name && (
              <div style={{ fontSize: 11, color: "#E24B4A", marginTop: 3 }}>
                {errors.name}
              </div>
            )}
          </div>
          {/* <div>
            <label style={labelStyle}>User ID *</label>
            <input
              style={inputStyle(errors.userID)}
              value={form.userID}
              onChange={(e) => set("userID", e.target.value)}
              placeholder="e.g. userID123"
            />
            {errors.userID && (
              <div style={{ fontSize: 11, color: "#E24B4A", marginTop: 3 }}>
                {errors.userID}
              </div>
            )}
          </div> */}
        </div>

        {/* Meal plan */}
        <div>
          <label style={labelStyle}>Meal plan *</label>
          <select
            style={inputStyle(false)}
            value={form.plan}
            onChange={(e) => set("plan", e.target.value)}
          >
            <option value="both">Lunch + Dinner — ₹3,200 / month</option>
            <option value="lunch">Lunch only — ₹1,800 / month</option>
            <option value="dinner">Dinner only — ₹1,800 / month</option>
          </select>
        </div>

        {/* Phone + Email */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              style={inputStyle(false)}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="9876543210"
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle(false)}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="student@email.com"
            />
          </div>
        </div>

        {/* Start + End date */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>Start date</label>
            <input
              type="date"
              style={inputStyle(false)}
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

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 4,
            paddingTop: 4,
            borderTop: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

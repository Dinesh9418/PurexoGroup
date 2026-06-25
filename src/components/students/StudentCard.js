import React from "react";
import { Avatar, PlanPill, BioDot, formatCurrency } from "../../utils/helpers";
import { useMessContext } from "../../context/MessContext";

export default function StudentCard({ student, selected, onClick }) {
  const { getDaysLeft, getPlanPrice, getPaymentStatus, getRemaining } =
    useMessContext();
  const isInactive = student.status === "inactive";
  const daysLeft = getDaysLeft(student.endDate);
  const isExpired = !isInactive && daysLeft <= 0;
  const barColor =
    daysLeft <= 3 ? "#E24B4A" : daysLeft <= 7 ? "#EF9F27" : "#1D9E75";
  const barPct = Math.min(100, Math.round(((31 - daysLeft) / 31) * 100));
  const status = getPaymentStatus(student);
  const remaining = getRemaining(student);
  const total = getPlanPrice(student.plan);
  const paid = student.paidAmount || 0;
  const payPct = total ? Math.round((paid / total) * 100) : 0;

  const statusColor =
    status === "paid"
      ? "#0F6E56"
      : status === "partial"
        ? "#854F0B"
        : "#A32D2D";
  const statusBg =
    status === "paid"
      ? "#EAF3DE"
      : status === "partial"
        ? "#FEF3DC"
        : "#FCEBEB";
  const statusLabel =
    status === "paid"
      ? "✓ Paid"
      : status === "partial"
        ? "◑ Partial"
        : "✗ Unpaid";

  console.log("Rendering StudentCard for:", student, student.name);
  return (
    <div
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        border: selected ? "2px solid #1D9E75" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "border-color 0.15s",
        opacity: isInactive ? 0.6 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Avatar initials={student.initials} color={student.avatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#1A1917",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {student.name}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#9E9C97",
              fontFamily: "JetBrains Mono, monospace",
              marginTop: 1,
            }}
          >
            {student.id}
          </div>
        </div>
        {(isInactive || isExpired) && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 5,
              flexShrink: 0,
              background: isInactive ? "#F3F2EF" : "#FCEBEB",
              color: isInactive ? "#6B6860" : "#A32D2D",
            }}
          >
            {isInactive ? "INACTIVE" : "EXPIRED"}
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <PlanPill plan={student.plan} />
        <BioDot registered={student.bioRegistered} />
      </div>

      {/* Duration bar */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#9E9C97",
            marginBottom: 3,
          }}
        >
          <span>Mess period</span>
          <span style={{ color: barColor, fontWeight: 500 }}>
            {daysLeft}d left
          </span>
        </div>
        <div
          style={{
            height: 3,
            background: "rgba(0,0,0,0.07)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: barPct + "%",
              height: "100%",
              background: barColor,
              borderRadius: 99,
            }}
          />
        </div>
      </div>

      {/* Payment mini bar */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#9E9C97",
            marginBottom: 3,
          }}
        >
          <span>Payment</span>
          <span style={{ fontWeight: 500 }}>
            {formatCurrency(paid)} / {formatCurrency(total)}
          </span>
        </div>
        <div
          style={{
            height: 3,
            background: "rgba(0,0,0,0.07)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: payPct + "%",
              height: "100%",
              background: status === "paid" ? "#1D9E75" : "#EF9F27",
              borderRadius: 99,
            }}
          />
        </div>
      </div>

      <span
        style={{
          background: statusBg,
          color: statusColor,
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 6,
        }}
      >
        {statusLabel}
      </span>
      {status === "partial" && (
        <span style={{ fontSize: 10, color: "#A32D2D", marginLeft: 6 }}>
          ₹{remaining.toLocaleString("en-IN")} due
        </span>
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  Avatar,
  formatDate,
  formatCurrency,
  PaymentBadge,
} from "../../utils/helpers";
import { useMessContext } from "../../context/MessContext";
import Button from "../common/Button";
import AddPaymentModal from "./AddPaymentModal";
import EditStudentModal from "./EditStudentModal";
import RenewModal from "./RenewModal";

export default function StudentDetail({ student }) {
  const {
    getPlanLabel,
    getPlanPrice,
    getDaysLeft,
    getPaymentStatus,
    getRemaining,
    registerBiometric,
    removeBiometric,
    deleteStudent,
    markStudentLeft,
  } = useMessContext();

  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  if (!student)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9E9C97",
          fontSize: 13,
        }}
      >
        Select a student to view details
      </div>
    );

  console.log("Rendering StudentDetail for:", student);
  const daysLeft = getDaysLeft(student.endDate);
  const isInactive = student.status === "inactive";
  const isExpired = !isInactive && daysLeft <= 0;
  const barColor =
    daysLeft <= 3 ? "#E24B4A" : daysLeft <= 7 ? "#EF9F27" : "#1D9E75";
  const barPct = Math.min(100, Math.round(((31 - daysLeft) / 31) * 100));
  const total = getPlanPrice(student.plan);
  const paid = student.paidAmount || 0;
  const remaining = getRemaining(student);
  const status = getPaymentStatus(student);
  const payPct = total ? Math.round((paid / total) * 100) : 0;

  return (
    <div
      style={{
        flex: 1,
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 14,
        padding: "24px",
        overflowY: "auto",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <Avatar
          initials={student.initials}
          color={student.avatar}
          size={56}
          fontSize={18}
        />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1917" }}>
            {student.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
                color: "#6B6860",
                background: "#F3F2EF",
                padding: "2px 8px",
                borderRadius: 5,
              }}
            >
              {student.id}
            </span>
            {/* <span style={{ fontSize: 11, color: "#9E9C97" }}>
              {student.room}
            </span> */}
          </div>
        </div>

        {/* Edit + Delete buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowEditModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            ✏️ Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (window.confirm(`Delete ${student.name}?`))
                deleteStudent(student.id);
            }}
          >
            🗑 Delete
          </Button>
        </div>
      </div>

      {/* ── Renewal / inactive banner ── */}
      {isInactive && (
        <div
          style={{
            background: "#F3F2EF",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
              Student left the mess
            </div>
            <div style={{ fontSize: 12, color: "#9E9C97", marginTop: 2 }}>
              {student.leftAt
                ? `Marked as left on ${formatDate(student.leftAt)}`
                : "Excluded from active counts, billing, and attendance"}
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowRenewModal(true)}
          >
            Re-activate
          </Button>
        </div>
      )}

      {!isInactive && isExpired && (
        <div
          style={{
            background: "#FCEBEB",
            border: "1px solid #F09595",
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#A32D2D" }}>
              Mess period ended
            </div>
            <div style={{ fontSize: 12, color: "#A32D2D", marginTop: 2, opacity: 0.85 }}>
              Ended on {formatDate(student.endDate)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(`Mark ${student.name} as left? They'll be moved to inactive — no data is deleted.`))
                  markStudentLeft(student.id);
              }}
            >
              Mark as left
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowRenewModal(true)}
            >
              Renew mess
            </Button>
          </div>
        </div>
      )}

      {!isInactive && !isExpired && daysLeft <= 7 && (
        <div
          style={{
            background: "#FEF3DC",
            border: "1px solid #FAC775",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 12, color: "#854F0B", fontWeight: 500 }}>
            Mess period ends in {daysLeft} day{daysLeft === 1 ? "" : "s"} — renew early to avoid a gap
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowRenewModal(true)}
          >
            Renew now
          </Button>
        </div>
      )}

      {/* ── Info grid ── */}
      <div
        className="form-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Meal plan", value: getPlanLabel(student.plan) },
          { label: "Monthly fee", value: formatCurrency(total) },
          { label: "Start date", value: formatDate(student.startDate) },
          { label: "End date", value: formatDate(student.endDate) },
          { label: "Phone", value: student.phone || "—" },
          { label: "Email", value: student.email || "—" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#F3F2EF",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "#9E9C97", marginBottom: 3 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1917" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Duration bar ── */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          <span style={{ color: "#6B6860" }}>Mess period progress</span>
          <span style={{ fontWeight: 600, color: barColor }}>
            {daysLeft} days remaining
          </span>
        </div>
        <div
          style={{
            height: 7,
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#9E9C97",
            marginTop: 4,
          }}
        >
          <span>{formatDate(student.startDate)}</span>
          <span>{formatDate(student.endDate)}</span>
        </div>
      </div>

      {/* ── Payment section ── */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          padding: "18px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
            Payment
          </div>
          <PaymentBadge status={status} />
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            <span style={{ color: "#6B6860" }}>
              Paid {formatCurrency(paid)} of {formatCurrency(total)}
            </span>
            <span
              style={{
                fontWeight: 600,
                color: status === "paid" ? "#0F6E56" : "#854F0B",
              }}
            >
              {payPct}%
            </span>
          </div>
          <div
            style={{
              height: 10,
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
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>

        <div
          className="form-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: "#E1F5EE",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "#0F6E56", marginBottom: 2 }}>
              Paid
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F6E56" }}>
              {formatCurrency(paid)}
            </div>
          </div>
          <div
            style={{
              background: remaining > 0 ? "#FCEBEB" : "#E1F5EE",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: remaining > 0 ? "#A32D2D" : "#0F6E56",
                marginBottom: 2,
              }}
            >
              Remaining
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: remaining > 0 ? "#A32D2D" : "#0F6E56",
              }}
            >
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>

        {remaining > 0 && (
          <Button
            variant="primary"
            onClick={() => setShowPayModal(true)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            + Add payment
          </Button>
        )}

        {/* Payment history */}
        {student.paymentHistory && student.paymentHistory.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: "#9E9C97",
                fontWeight: 600,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Payment history
            </div>
            {student.paymentHistory.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 12, fontWeight: 500, color: "#1A1917" }}
                  >
                    {p.note || "Payment received"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9E9C97", marginTop: 1 }}>
                    {formatDate(p.date)}
                  </div>
                </div>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#0F6E56" }}
                >
                  {formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Biometric ── */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1917",
            marginBottom: 12,
          }}
        >
          Biometric access
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              flexShrink: 0,
              background: student.bioRegistered ? "#E1F5EE" : "#F3F2EF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ❋
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1917" }}>
              {student.bioRegistered
                ? "Fingerprint registered"
                : "No biometric enrolled"}
            </div>
            <div style={{ fontSize: 12, color: "#9E9C97", marginTop: 3 }}>
              {student.bioRegistered
                ? "Student can check in via fingerprint scanner."
                : "Enroll to enable biometric meal check-in."}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {student.bioRegistered ? (
                <>
                  <Button size="sm" onClick={() => {}}>
                    Re-enroll
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeBiometric(student.id)}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => registerBiometric(student.id)}
                >
                  Enroll fingerprint
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPayModal && (
        <AddPaymentModal
          student={student}
          onClose={() => setShowPayModal(false)}
        />
      )}
      {showEditModal && (
        <EditStudentModal
          student={student}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {showRenewModal && (
        <RenewModal
          student={student}
          onClose={() => setShowRenewModal(false)}
        />
      )}
    </div>
  );
}

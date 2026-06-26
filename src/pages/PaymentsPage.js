import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useMessContext } from "../context/MessContext";
import {
  Avatar,
  formatCurrency,
  // formatDate,
  PaymentBadge,
  UserStatusBadge,
} from "../utils/helpers";
import Button from "../components/common/Button";
import StatCard from "../components/common/StatCard";
import AddPaymentModal from "../components/students/AddPaymentModal";

export default function PaymentsPage() {
  const {
    students,
    getPlanPrice,
    getPlanLabel,
    getPaymentStatus,
    getRemaining,
    stats,
  } = useMessContext();
  const [filter, setFilter] = useState("All");
  const [payTarget, setPayTarget] = useState(null); // student to pay
  // const [printData, setPrintData] = useState();
  const [hover, setHover] = useState(false);

  const filtered = students.filter((s) => {
    const st = getPaymentStatus(s);
    if (filter === "All") return true;
    if (filter === "Paid") return st === "paid";
    if (filter === "Partial") return st === "partial";
    if (filter === "Unpaid") return st === "unpaid";
    return true;
  });
  console.log("Filtered students for PaymentsPage:", filtered);

  function handlePrint() {
    // Prepare data for Excel
    const data = filtered.map((s) => {
      const total = getPlanPrice(s.plan);
      const paid = s.paidAmount || 0;
      const remaining = getRemaining(s);
      const status = getPaymentStatus(s);
      const UserStatus = s.status; // Assuming 'status' is the property that holds the user's status

      return {
        UserStatus: s.status,
        ID: s.id,
        Name: s.name,
        Plan: getPlanLabel(s.plan),
        "Total Fee": total,
        Paid: paid,
        "Payment Mode": status,
        Remaining: remaining,
        Status: status,
      };
    });

    console.log("Data prepared for Excel export:", data);
    const today = new Date();
    const formattedDate = today
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    // Export to Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `PaymentRecords-${formattedDate}.xlsx`);
  }

  console.log("Stats in PaymentsPage:", stats);
  return (
    <div className="page-padded">
      {/* Stats */}`
      <div
        className="grid-4"
        style={{
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Expected"
          value={formatCurrency(stats.expectedRevenue)}
          icon="₹"
        />
        <StatCard
          label="Collected"
          value={formatCurrency(stats.collectedRevenue)}
          valueColor="#0F6E56"
          icon="✓"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.pendingRevenue)}
          valueColor="#A32D2D"
          icon="⚠"
        />
        <StatCard
          label="Fully paid"
          value={`${stats.fullyPaid} / ${stats.total}`}
          valueColor="#0F6E56"
          icon="◎"
          sub={`${stats.partialPaid} partial · ${stats.unpaid} unpaid`}
        />
      </div>
      {/* Table card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A1917" }}>
            Payment records
          </h3>
          <div className="filters-row" style={{ display: "flex", gap: 4 }}>
            <button
              onClick={handlePrint}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid rgba(0,0,0,0.09)",
                // background: "transparent",
                background: hover ? "#E1F5EE" : "transparent",
                color: hover ? "#0F6E56" : "#6B6860",
                cursor: "pointer",
              }}
            >
              <i class="fa-solid fa-print"></i>
            </button>
            {["All", "Paid", "Partial", "Unpaid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  borderRadius: 6,
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
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            className="payments-table"
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}
          >
            <thead>
              <tr style={{ background: "#F3F2EF" }}>
                {[
                  "Student",
                  "ID",
                  "Plan",
                  // "Total Fee",
                  "Paid",
                  "Remaining",
                  "Status",
                  "User Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#9E9C97",
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const total = getPlanPrice(s.plan);
                const paid = s.paidAmount || 0;
                const remaining = getRemaining(s);
                const status = getPaymentStatus(s);
                const payPct = total ? Math.round((paid / total) * 100) : 0;
                const UserStatus = s.status; // Assuming 'status' is the property that holds the user's status
                console.log(
                  `Student: ${s.name}, UserStatus: ${UserStatus}, PaymentStatus: ${status}`,
                );

                return (
                  // {UserStatus === "active" ? (<>
                  <tr
                    key={s.id}
                    // style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    style={{
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      background:
                        s.status === "inactive" ? "#e58b8b" : "transparent",
                    }}
                  >
                    {/* Student */}
                    <td data-label="Student" style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Avatar
                          initials={s.initials}
                          color={s.avatar}
                          size={32}
                          fontSize={11}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#1A1917",
                            }}
                          >
                            {s.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#9E9C97" }}>
                            {s.userID}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* ID */}
                    <td data-label="ID" style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#6B6860",
                          background: "#F3F2EF",
                          padding: "2px 7px",
                          borderRadius: 4,
                        }}
                      >
                        {s.id}
                      </span>
                    </td>
                    {/* Plan */}
                    <td
                      data-label="Plan"
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#6B6860",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getPlanLabel(s.plan)}
                    </td>
                    {/* Total */}
                    {/* <td
                      data-label="Total Fee"
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1A1917",
                      }}
                    >
                      {formatCurrency(total)}
                    </td> */}
                    {/* Paid + mini bar */}
                    <td data-label="Paid" style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0F6E56",
                        }}
                      >
                        {formatCurrency(paid)}
                      </div>
                      <div
                        style={{
                          width: 80,
                          height: 3,
                          background: "rgba(0,0,0,0.07)",
                          borderRadius: 99,
                          overflow: "hidden",
                          marginTop: 4,
                        }}
                      >
                        <div
                          style={{
                            width: payPct + "%",
                            height: "100%",
                            background:
                              status === "paid" ? "#1D9E75" : "#EF9F27",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    </td>
                    {/* Remaining */}
                    <td
                      data-label="Remaining"
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: remaining > 0 ? "#A32D2D" : "#0F6E56",
                      }}
                    >
                      {formatCurrency(remaining)}
                    </td>
                    {/* Status badge */}
                    <td data-label="Status" style={{ padding: "12px 16px" }}>
                      <PaymentBadge status={status} />
                    </td>

                    {/* User status badge */}
                    <td data-label="Status" style={{ padding: "12px 16px" }}>
                      <UserStatusBadge status={UserStatus} />
                    </td>

                    {/* Action */}
                    <td
                      data-label="Action"
                      style={{ padding: "5px", fontSize: 8 }}
                    >
                      {status !== "paid" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setPayTarget(s)}
                        >
                          Add payment
                        </Button>
                      ) : (
                        <span style={{ fontSize: 9, color: "#9E9C97" }}>—</span>
                      )}
                    </td>
                  </tr>
                  // </>) : null}
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#9E9C97",
              fontSize: 13,
            }}
          >
            No records found
          </div>
        )}
      </div>
      {payTarget && (
        <AddPaymentModal
          student={payTarget}
          onClose={() => setPayTarget(null)}
        />
      )}
    </div>
  );
}

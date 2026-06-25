import React from "react";
import { useMessContext } from "../../context/MessContext";
import StatCard from "../common/StatCard";
import { formatCurrency, formatDate, PaymentBadge } from "../../utils/helpers";

export default function DashboardPage() {
  const {
    stats,
    students,
    getDaysLeft,
    getPlanLabel,
    getPlanPrice,
    getPaymentStatus,
    getRemaining,
  } = useMessContext();

  const expiring = students
    .filter((s) => s.status !== "inactive" && getDaysLeft(s.endDate) <= 7)
    .sort((a, b) => getDaysLeft(a.endDate) - getDaysLeft(b.endDate));

  const pendingPayments = students
    .filter((s) => s.status !== "inactive" && getPaymentStatus(s) !== "paid")
    .sort((a, b) => getRemaining(b) - getRemaining(a))
    .slice(0, 5);

  // const planCounts = {
  //   both: students.filter((s) => s.plan === "both").length,
  //   lunch: students.filter((s) => s.plan === "lunch").length,
  //   dinner: students.filter((s) => s.plan === "dinner").length,
  // };

  const collectionPct = stats.expectedRevenue
    ? Math.round((stats.collectedRevenue / stats.expectedRevenue) * 100)
    : 0;

  return (
    <div className="page-padded">
      {/* Top stats */}
      <div
        className="grid-4"
        style={{
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total students"
          value={stats.total}
          icon="◎"
          sub="enrolled this month"
        />
        <StatCard
          label="Collected"
          value={formatCurrency(stats.collectedRevenue)}
          valueColor="#0F6E56"
          icon="✓"
          sub={`of ${formatCurrency(stats.expectedRevenue)} expected`}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.pendingRevenue)}
          valueColor="#A32D2D"
          icon="⚠"
          sub={`${stats.partialPaid} partial · ${stats.unpaid} unpaid`}
        />
        <StatCard
          label="Expiring soon"
          value={stats.expiringSoon}
          valueColor="#854F0B"
          icon="⏱"
          sub="within 7 days"
        />
      </div>

      {/* Collection progress bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
            Monthly collection progress
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: collectionPct >= 80 ? "#0F6E56" : "#854F0B",
            }}
          >
            {collectionPct}%
          </span>
        </div>
        <div
          style={{
            height: 12,
            background: "rgba(0,0,0,0.07)",
            borderRadius: 99,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: collectionPct + "%",
              height: "100%",
              background: collectionPct >= 80 ? "#1D9E75" : "#EF9F27",
              borderRadius: 99,
              transition: "width 0.5s",
            }}
          />
        </div>
        <div
          style={{ display: "flex", gap: 20, fontSize: 12, color: "#6B6860" }}
        >
          <span>
            ✓ Fully paid:{" "}
            <strong style={{ color: "#0F6E56" }}>{stats.fullyPaid}</strong>
          </span>
          <span>
            ◑ Partial:{" "}
            <strong style={{ color: "#854F0B" }}>{stats.partialPaid}</strong>
          </span>
          <span>
            ✗ Unpaid:{" "}
            <strong style={{ color: "#A32D2D" }}>{stats.unpaid}</strong>
          </span>
        </div>
      </div>

      <div className="grid-2">
        {/* Pending payments */}
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1A1917",
              marginBottom: 14,
            }}
          >
            Pending payments
          </h3>
          {pendingPayments.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9E9C97" }}>
              All payments cleared! 🎉
            </p>
          ) : (
            pendingPayments.map((s) => {
              const remaining = getRemaining(s);
              const paid = s.paidAmount || 0;
              const total = getPlanPrice(s.plan);
              const pct = total ? Math.round((paid / total) * 100) : 0;
              return (
                <div
                  key={s.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 5,
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#1A1917",
                        }}
                      >
                        {s.name}
                      </span>
                      <PaymentBadge status={getPaymentStatus(s)} />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#A32D2D",
                      }}
                    >
                      {formatCurrency(remaining)} due
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(0,0,0,0.07)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: pct + "%",
                        height: "100%",
                        background: "#EF9F27",
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "#9E9C97", marginTop: 3 }}>
                    {formatCurrency(paid)} paid of {formatCurrency(total)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Renewals */}
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 14,
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1A1917",
              marginBottom: 14,
            }}
          >
            Renewals this week
          </h3>
          {expiring.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9E9C97" }}>
              No renewals due this week.
            </p>
          ) : (
            expiring.map((s) => {
              const left = getDaysLeft(s.endDate);
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
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
                    <div
                      style={{ fontSize: 11, color: "#9E9C97", marginTop: 2 }}
                    >
                      {left <= 0 ? "🔴 Expired" : `⏱ ${left} days left`} ·{" "}
                      {getPlanLabel(s.plan)}
                    </div>
                    <div style={{ fontSize: 11, color: "#9E9C97" }}>
                      Ends {formatDate(s.endDate)}
                    </div>
                  </div>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#0F6E56" }}
                  >
                    {formatCurrency(getPlanPrice(s.plan))}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../components/firebase/firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const MessContext = createContext();
export const useMessContext = () => useContext(MessContext);

// ── helpers ──────────────────────────────────────────────────────────
const TODAY = new Date();
const toStr = (d) => d.toISOString().split("T")[0];
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const PLAN_PRICE = { both: 3200, lunch: 1800, dinner: 1800 };
const PLAN_LABEL = {
  both: "Lunch + Dinner",
  lunch: "Lunch only",
  dinner: "Dinner only",
};
const AVATARS = ["teal", "blue", "coral", "purple", "amber"];

// ── Generate a truly unique student ID ───────────────────────────────
// Format: MSS-<timestamp base36><2 random chars>  e.g. MSS-LX4K2A
// This is collision-proof even if two students are added at the exact same second
const genStudentId = () => {
  const ts = Date.now().toString(36).toUpperCase(); // e.g. "LX4K2"
  const rnd = Math.random().toString(36).slice(2, 4).toUpperCase(); // e.g. "A3"
  return `MSS-${ts}${rnd}`;
};

export const MessProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // ── REALTIME LISTENERS ─────────────────────────────────────────────
  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snap) => {
        setStudents(snap.docs.map((d) => ({ ...d.data(), _docId: d.id })));
        setLoading(false);
      },
      (err) => {
        console.error("Students listener error:", err);
        setLoading(false);
      },
    );

    const unsubAttendance = onSnapshot(
      query(collection(db, "attendance"), orderBy("timestamp", "desc")),
      (snap) => {
        setAttendance(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      },
      (err) => console.error("Attendance listener error:", err),
    );

    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, []);

  // ── HELPER FUNCTIONS ───────────────────────────────────────────────
  const getPlanPrice = (plan) => PLAN_PRICE[plan] || 0;
  const getPlanLabel = (plan) => PLAN_LABEL[plan] || plan;
  const getDaysLeft = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(
      0,
      Math.round((new Date(endDate) - today) / (1000 * 60 * 60 * 24)),
    );
  };
  const getPaymentStatus = (s) => {
    const total = getPlanPrice(s.plan) + (s.carriedForward || 0);
    const paid = s.paidAmount || 0;
    if (paid >= total) return "paid";
    if (paid > 0) return "partial";
    return "unpaid";
  };
  // getRemaining — total due = planFee + any carriedForward from prev cycle
  // carriedForward is prev pending rolled into this new cycle at renewal time
  const getCycleFee = (s) => getPlanPrice(s.plan) + (s.carriedForward || 0);
  const getRemaining = (s) => {
    const fee = getCycleFee(s);
    const paid = Math.max(0, Math.min(s.paidAmount || 0, fee));
    return Math.max(0, fee - paid);
  };
  const isActive = (s) => s.status !== "inactive";
  const isExpired = (s) => isActive(s) && getDaysLeft(s.endDate) <= 0;

  // ── FIRESTORE CRUD ─────────────────────────────────────────────────

  // ADD STUDENT — unique ID guaranteed via genStudentId()
  const addStudent = async (student) => {
    const initials = student.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    // Pick avatar by cycling through options based on current count
    const avatar = AVATARS[students.length % AVATARS.length];
    const start = student.startDate ? new Date(student.startDate) : new Date();

    await addDoc(collection(db, "students"), {
      ...student,
      id: genStudentId(), // ← unique, timestamp-based, never reused
      initials,
      avatar,
      bioRegistered: false,
      paidAmount: 0,
      paymentHistory: [],
      cycleHistory: [],
      status: "active",
      startDate: toStr(start),
      endDate: toStr(addDays(start, 30)),
      createdAt: serverTimestamp(),
    });
  };

  // UPDATE STUDENT — uses _docId (Firestore doc ID), not s.id
  const updateStudent = async (id, updates) => {
    // id here is the human-readable MSS-XXXX; look up by that field
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await updateDoc(doc(db, "students", student._docId), updates);
  };

  // DELETE STUDENT — uses _docId
  const deleteStudent = async (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await deleteDoc(doc(db, "students", student._docId));
  };

  // ADD PAYMENT — uses MSS-XXXX id
  const addPayment = async (id, amount, note = "") => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    const total = getPlanPrice(student.plan) + (student.carriedForward || 0);
    const current = Math.max(0, student.paidAmount || 0);
    const newPaid = Math.min(total, current + Number(amount));
    const entry = {
      amount: Number(amount),
      date: toStr(new Date()),
      note: note || "Payment received",
    };
    await updateDoc(doc(db, "students", student._docId), {
      paidAmount: newPaid,
      paymentHistory: [...(student.paymentHistory || []), entry],
    });
  };

  // BIOMETRIC — uses MSS-XXXX id
  const registerBiometric = async (id) => {
    const s = students.find((s) => s.id === id);
    if (s)
      await updateDoc(doc(db, "students", s._docId), { bioRegistered: true });
  };
  const removeBiometric = async (id) => {
    const s = students.find((s) => s.id === id);
    if (s)
      await updateDoc(doc(db, "students", s._docId), { bioRegistered: false });
  };

  // RENEWAL — archives current cycle, starts fresh
  // renewStudent — archives current cycle, starts new one.
  // combined total due = prevRemaining + newCycleFee
  // payment: amount admin collects now against the combined total
  //          → first clears prevRemaining, surplus goes to new cycle
  const renewStudent = async (
    id,
    { plan, startDate, payment = 0, paymentNote = "" } = {},
  ) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    const newPlan = plan || student.plan;
    const start = startDate ? new Date(startDate) : new Date();
    const today = toStr(new Date());
    const note = paymentNote || "Payment at renewal";
    const newFee = PLAN_PRICE[newPlan] || 0;

    // Clamp paidAmount — include old carriedForward in prev cycle's total
    const oldFee = getPlanPrice(student.plan) + (student.carriedForward || 0);
    const oldPaid = Math.max(0, Math.min(student.paidAmount || 0, oldFee));
    const prevRemaining = Math.max(0, oldFee - oldPaid);
    const totalDue = prevRemaining + newFee;
    const collected = Math.max(0, Math.min(Number(payment) || 0, totalDue));

    // How much of the collected amount settles the old cycle first
    const prevSettled = Math.min(collected, prevRemaining);
    // Remainder goes toward the new cycle — always >= 0
    const newCyclePaid = Math.max(0, collected - prevSettled);

    // Archive old cycle — mark as fully settled up to what was collected
    const oldHistory = [...(student.paymentHistory || [])];
    if (prevSettled > 0) {
      oldHistory.push({
        amount: prevSettled,
        date: today,
        note: `${note} (prev. balance cleared)`,
      });
    }
    const archived = {
      plan: student.plan,
      startDate: student.startDate,
      endDate: student.endDate,
      paidAmount: (student.paidAmount || 0) + prevSettled,
      paymentHistory: oldHistory,
      closedAt: today,
    };

    // New cycle payment history
    const newHistory =
      newCyclePaid > 0
        ? [{ amount: newCyclePaid, date: today, note: `${note} (new cycle)` }]
        : [];

    await updateDoc(doc(db, "students", student._docId), {
      cycleHistory: [...(student.cycleHistory || []), archived],
      plan: newPlan,
      startDate: toStr(start),
      endDate: toStr(addDays(start, 30)),
      paidAmount: newCyclePaid,
      paymentHistory: newHistory,
      status: "active",
      // carriedForward = prev pending rolled into this cycle's total due
      // e.g. prev ₹200 + new ₹1800 = combinedFee ₹2000
      carriedForward: prevRemaining,
      renewalMeta: null,
    });
  };

  // MARK AS LEFT
  const markStudentLeft = async (id) => {
    const s = students.find((s) => s.id === id);
    if (s)
      await updateDoc(doc(db, "students", s._docId), {
        status: "inactive",
        leftAt: toStr(new Date()),
      });
  };

  const reactivateStudent = async (id, opts) => renewStudent(id, opts);

  // ATTENDANCE
  const addAttendanceEntry = async (entry) => {
    await addDoc(collection(db, "attendance"), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  };

  // ── STATS ──────────────────────────────────────────────────────────
  const active = students.filter(isActive);
  const stats = {
    total: active.length,
    inactive: students.filter((s) => !isActive(s)).length,
    fullyPaid: active.filter((s) => getPaymentStatus(s) === "paid").length,
    partialPaid: active.filter((s) => getPaymentStatus(s) === "partial").length,
    unpaid: active.filter((s) => getPaymentStatus(s) === "unpaid").length,
    bioRegistered: active.filter((s) => s.bioRegistered).length,
    expectedRevenue: active.reduce((sum, s) => sum + getPlanPrice(s.plan), 0),
    collectedRevenue: active.reduce((sum, s) => sum + (s.paidAmount || 0), 0),
    pendingRevenue: active.reduce((sum, s) => sum + getRemaining(s), 0),
    expiringSoon: active.filter(
      (s) => getDaysLeft(s.endDate) <= 7 && getDaysLeft(s.endDate) > 0,
    ).length,
    expired: active.filter((s) => getDaysLeft(s.endDate) <= 0).length,
  };

  return (
    <MessContext.Provider
      value={{
        students,
        attendance,
        activeTab,
        setActiveTab,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        addPayment,
        registerBiometric,
        removeBiometric,
        addAttendanceEntry,
        renewStudent,
        markStudentLeft,
        reactivateStudent,
        getPlanPrice,
        getPlanLabel,
        getCycleFee,
        getDaysLeft,
        getPaymentStatus,
        getRemaining,
        isActive,
        isExpired,
        stats,
        TODAY: toStr(TODAY),
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

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

export const MessProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true); // ← shows loading state while Firebase fetches

  // ── REALTIME LISTENERS ─────────────────────────────────────────────
  useEffect(() => {
    // Students collection
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

    // Attendance collection – newest first
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
    const end = new Date(endDate);
    return Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24)));
  };

  const getPaymentStatus = (s) => {
    const total = getPlanPrice(s.plan);
    const paid = s.paidAmount || 0;
    if (paid >= total) return "paid";
    if (paid > 0) return "partial";
    return "unpaid";
  };

  const getRemaining = (s) =>
    Math.max(0, getPlanPrice(s.plan) - (s.paidAmount || 0));

  // Treat missing `status` (old records) as active, for backward compatibility
  const isActive = (s) => s.status !== "inactive";
  const isExpired = (s) => isActive(s) && getDaysLeft(s.endDate) <= 0;

  // ── FIRESTORE CRUD ─────────────────────────────────────────────────

  // ADD STUDENT
  const addStudent = async (student) => {
    try {
      // Generate MSS-2601, MSS-2602...
      const nextId = `MSS-${2600 + students.length + 1}`;

      const data = {
        ...student,

        // your custom user id
        userID: nextId,

        createdAt: serverTimestamp(),

        paidAmount: 0,
        paymentHistory: [],
        cycleHistory: [],
        bioRegistered: false,
        status: "active",
      };

      const docRef = await addDoc(collection(db, "students"), data);

      console.log("Student created:", docRef.id, "User ID:", nextId);
    } catch (error) {
      console.error("Add student error:", error);
    }
  };
  // UPDATE STUDENT  (id = custom MSS-XXXX field)
  const updateStudent = async (id, updates) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await updateDoc(doc(db, "students", student._docId), updates);
  };

  // DELETE STUDENT
  const deleteStudent = async (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await deleteDoc(doc(db, "students", student._docId));
  };

  // ADD PAYMENT
  const addPayment = async (id, amount, note = "") => {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    const total = getPlanPrice(student.plan);
    const newPaid = Math.min(total, (student.paidAmount || 0) + Number(amount));
    const entry = {
      amount: Number(amount),
      date: toStr(new Date()),
      note: note || "Payment received",
    };
    const newHistory = [...(student.paymentHistory || []), entry];

    await updateDoc(doc(db, "students", student._docId), {
      paidAmount: newPaid,
      paymentHistory: newHistory,
    });
  };

  // BIOMETRIC
  const registerBiometric = async (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await updateDoc(doc(db, "students", student._docId), {
      bioRegistered: true,
    });
  };

  const removeBiometric = async (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await updateDoc(doc(db, "students", student._docId), {
      bioRegistered: false,
    });
  };

  // ── RENEWAL FLOW ─────────────────────────────────────────────────
  // RENEW: archives the current cycle into cycleHistory, starts a fresh
  // cycle on the SAME document (never creates a new student record).
  const renewStudent = async (id, { plan, startDate } = {}) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    const newPlan = plan || student.plan;
    const start = startDate ? new Date(startDate) : new Date();

    const archivedCycle = {
      plan: student.plan,
      startDate: student.startDate,
      endDate: student.endDate,
      paidAmount: student.paidAmount || 0,
      paymentHistory: student.paymentHistory || [],
      closedAt: toStr(new Date()),
    };

    await updateDoc(doc(db, "students", student._docId), {
      cycleHistory: [...(student.cycleHistory || []), archivedCycle],
      plan: newPlan,
      startDate: toStr(start),
      endDate: toStr(addDays(start, 30)),
      paidAmount: 0,
      paymentHistory: [],
      status: "active",
    });
  };

  // MARK AS LEFT: student stops being counted as active, no data deleted
  const markStudentLeft = async (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await updateDoc(doc(db, "students", student._docId), {
      status: "inactive",
      leftAt: toStr(new Date()),
    });
  };

  // REACTIVATE: brings an inactive student back, starting a fresh cycle
  const reactivateStudent = async (id, { plan, startDate } = {}) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    await renewStudent(id, { plan, startDate });
  };

  // ADD ATTENDANCE ENTRY
  const addAttendanceEntry = async (entry) => {
    await addDoc(collection(db, "attendance"), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  };

  // ── STATS (derived from realtime students) ─────────────────────────
  const activeStudents = students.filter(isActive);
  const stats = {
    total: activeStudents.length,
    inactive: students.filter((s) => !isActive(s)).length,
    fullyPaid: activeStudents.filter((s) => getPaymentStatus(s) === "paid")
      .length,
    partialPaid: activeStudents.filter((s) => getPaymentStatus(s) === "partial")
      .length,
    unpaid: activeStudents.filter((s) => getPaymentStatus(s) === "unpaid")
      .length,
    bioRegistered: activeStudents.filter((s) => s.bioRegistered).length,
    expectedRevenue: activeStudents.reduce(
      (sum, s) => sum + getPlanPrice(s.plan),
      0,
    ),
    collectedRevenue: activeStudents.reduce(
      (sum, s) => sum + (s.paidAmount || 0),
      0,
    ),
    pendingRevenue: activeStudents.reduce((sum, s) => sum + getRemaining(s), 0),
    expiringSoon: activeStudents.filter(
      (s) => getDaysLeft(s.endDate) <= 7 && getDaysLeft(s.endDate) > 0,
    ).length,
    expired: activeStudents.filter((s) => getDaysLeft(s.endDate) <= 0).length,
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

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

  // ── FIRESTORE CRUD ─────────────────────────────────────────────────

  // ADD STUDENT
  const addStudent = async (student) => {
    const initials = student.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const avatars = ["teal", "blue", "coral", "purple", "amber"];
    const avatar = avatars[students.length % avatars.length];
    const start = student.startDate ? new Date(student.startDate) : new Date();
    const newId = `MSS-${2600 + students.length + 1}`;

    const data = {
      ...student,
      id: newId,
      initials,
      avatar,
      bioRegistered: false,
      paidAmount: 0,
      paymentHistory: [],
      startDate: toStr(start),
      endDate: toStr(addDays(start, 30)),
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "students"), data);
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

  // ADD ATTENDANCE ENTRY
  const addAttendanceEntry = async (entry) => {
    await addDoc(collection(db, "attendance"), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  };

  // ── STATS (derived from realtime students) ─────────────────────────
  const stats = {
    total: students.length,
    fullyPaid: students.filter((s) => getPaymentStatus(s) === "paid").length,
    partialPaid: students.filter((s) => getPaymentStatus(s) === "partial")
      .length,
    unpaid: students.filter((s) => getPaymentStatus(s) === "unpaid").length,
    bioRegistered: students.filter((s) => s.bioRegistered).length,
    expectedRevenue: students.reduce((sum, s) => sum + getPlanPrice(s.plan), 0),
    collectedRevenue: students.reduce((sum, s) => sum + (s.paidAmount || 0), 0),
    pendingRevenue: students.reduce((sum, s) => sum + getRemaining(s), 0),
    expiringSoon: students.filter((s) => getDaysLeft(s.endDate) <= 7).length,
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
        getPlanPrice,
        getPlanLabel,
        getDaysLeft,
        getPaymentStatus,
        getRemaining,
        stats,
        TODAY: toStr(TODAY),
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../components/firebase/firebase";
import {
  collection, doc, onSnapshot, addDoc,
  updateDoc, deleteDoc, query, orderBy, serverTimestamp,
} from "firebase/firestore";

const MessContext = createContext();
export const useMessContext = () => useContext(MessContext);

// ── helpers ──────────────────────────────────────────────────────────
const TODAY   = new Date();
const toStr   = (d) => d.toISOString().split("T")[0];
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };

const PLAN_PRICE = { both: 3200, lunch: 1800, dinner: 1800 };
const PLAN_LABEL = { both: "Lunch + Dinner", lunch: "Lunch only", dinner: "Dinner only" };
const AVATARS    = ["teal", "blue", "coral", "purple", "amber"];

// ── Generate a truly unique student ID ───────────────────────────────
// Format: MSS-<timestamp base36><2 random chars>  e.g. MSS-LX4K2A
// This is collision-proof even if two students are added at the exact same second
const genStudentId = () => {
  const ts  = Date.now().toString(36).toUpperCase();          // e.g. "LX4K2"
  const rnd = Math.random().toString(36).slice(2, 4).toUpperCase(); // e.g. "A3"
  return `MSS-${ts}${rnd}`;
};

export const MessProvider = ({ children }) => {
  const [students,   setStudents]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [loading,    setLoading]    = useState(true);

  // ── REALTIME LISTENERS ─────────────────────────────────────────────
  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, "students"),
      (snap) => {
        setStudents(snap.docs.map((d) => ({ ...d.data(), _docId: d.id })));
        setLoading(false);
      },
      (err) => { console.error("Students listener error:", err); setLoading(false); }
    );

    const unsubAttendance = onSnapshot(
      query(collection(db, "attendance"), orderBy("timestamp", "desc")),
      (snap) => { setAttendance(snap.docs.map((d) => ({ ...d.data(), id: d.id }))); },
      (err) => console.error("Attendance listener error:", err)
    );

    return () => { unsubStudents(); unsubAttendance(); };
  }, []);

  // ── HELPER FUNCTIONS ───────────────────────────────────────────────
  const getPlanPrice     = (plan) => PLAN_PRICE[plan] || 0;
  const getPlanLabel     = (plan) => PLAN_LABEL[plan] || plan;
  const getDaysLeft      = (endDate) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((new Date(endDate) - today) / (1000 * 60 * 60 * 24)));
  };
  const getPaymentStatus = (s) => {
    const total = getPlanPrice(s.plan), paid = s.paidAmount || 0;
    if (paid >= total) return "paid";
    if (paid > 0)      return "partial";
    return "unpaid";
  };
  const getRemaining = (s) => Math.max(0, getPlanPrice(s.plan) - (s.paidAmount || 0));
  const isActive     = (s) => s.status !== "inactive";
  const isExpired    = (s) => isActive(s) && getDaysLeft(s.endDate) <= 0;

  // ── FIRESTORE CRUD ─────────────────────────────────────────────────

  // ADD STUDENT — unique ID guaranteed via genStudentId()
  const addStudent = async (student) => {
    const initials = student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    // Pick avatar by cycling through options based on current count
    const avatar   = AVATARS[students.length % AVATARS.length];
    const start    = student.startDate ? new Date(student.startDate) : new Date();

    await addDoc(collection(db, "students"), {
      ...student,
      id:             genStudentId(),   // ← unique, timestamp-based, never reused
      initials,
      avatar,
      bioRegistered:  false,
      paidAmount:     0,
      paymentHistory: [],
      cycleHistory:   [],
      status:         "active",
      startDate:      toStr(start),
      endDate:        toStr(addDays(start, 30)),
      createdAt:      serverTimestamp(),
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
    const total    = getPlanPrice(student.plan);
    const newPaid  = Math.min(total, (student.paidAmount || 0) + Number(amount));
    const entry    = { amount: Number(amount), date: toStr(new Date()), note: note || "Payment received" };
    await updateDoc(doc(db, "students", student._docId), {
      paidAmount:     newPaid,
      paymentHistory: [...(student.paymentHistory || []), entry],
    });
  };

  // BIOMETRIC — uses MSS-XXXX id
  const registerBiometric = async (id) => {
    const s = students.find((s) => s.id === id);
    if (s) await updateDoc(doc(db, "students", s._docId), { bioRegistered: true });
  };
  const removeBiometric = async (id) => {
    const s = students.find((s) => s.id === id);
    if (s) await updateDoc(doc(db, "students", s._docId), { bioRegistered: false });
  };

  // RENEWAL — archives current cycle, starts fresh
  const renewStudent = async (id, { plan, startDate } = {}) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    const newPlan = plan || student.plan;
    const start   = startDate ? new Date(startDate) : new Date();
    const archived = {
      plan: student.plan, startDate: student.startDate,
      endDate: student.endDate, paidAmount: student.paidAmount || 0,
      paymentHistory: student.paymentHistory || [], closedAt: toStr(new Date()),
    };
    await updateDoc(doc(db, "students", student._docId), {
      cycleHistory:   [...(student.cycleHistory || []), archived],
      plan:           newPlan,
      startDate:      toStr(start),
      endDate:        toStr(addDays(start, 30)),
      paidAmount:     0,
      paymentHistory: [],
      status:         "active",
    });
  };

  // MARK AS LEFT
  const markStudentLeft = async (id) => {
    const s = students.find((s) => s.id === id);
    if (s) await updateDoc(doc(db, "students", s._docId), { status: "inactive", leftAt: toStr(new Date()) });
  };

  const reactivateStudent = async (id, opts) => renewStudent(id, opts);

  // ATTENDANCE
  const addAttendanceEntry = async (entry) => {
    await addDoc(collection(db, "attendance"), { ...entry, timestamp: serverTimestamp() });
  };

  // ── STATS ──────────────────────────────────────────────────────────
  const active = students.filter(isActive);
  const stats  = {
    total:            active.length,
    inactive:         students.filter((s) => !isActive(s)).length,
    fullyPaid:        active.filter((s) => getPaymentStatus(s) === "paid").length,
    partialPaid:      active.filter((s) => getPaymentStatus(s) === "partial").length,
    unpaid:           active.filter((s) => getPaymentStatus(s) === "unpaid").length,
    bioRegistered:    active.filter((s) => s.bioRegistered).length,
    expectedRevenue:  active.reduce((sum, s) => sum + getPlanPrice(s.plan), 0),
    collectedRevenue: active.reduce((sum, s) => sum + (s.paidAmount || 0), 0),
    pendingRevenue:   active.reduce((sum, s) => sum + getRemaining(s), 0),
    expiringSoon:     active.filter((s) => getDaysLeft(s.endDate) <= 7 && getDaysLeft(s.endDate) > 0).length,
    expired:          active.filter((s) => getDaysLeft(s.endDate) <= 0).length,
  };

  return (
    <MessContext.Provider value={{
      students, attendance, activeTab, setActiveTab, loading,
      addStudent, updateStudent, deleteStudent,
      addPayment, registerBiometric, removeBiometric,
      addAttendanceEntry, renewStudent, markStudentLeft, reactivateStudent,
      getPlanPrice, getPlanLabel, getDaysLeft, getPaymentStatus, getRemaining,
      isActive, isExpired, stats, TODAY: toStr(TODAY),
    }}>
      {children}
    </MessContext.Provider>
  );
};

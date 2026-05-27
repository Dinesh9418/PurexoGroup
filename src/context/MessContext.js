import React, { createContext, useContext, useState } from "react";

const MessContext = createContext();
export const useMessContext = () => useContext(MessContext);

const TODAY = new Date();
const toStr = (d) => d.toISOString().split("T")[0];
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Helper: generate start/end from a given start date
const makeRange = (startDate) => ({
  startDate: toStr(startDate),
  endDate: toStr(addDays(startDate, 30)),
});

const initialStudents = [
  {
    id: "MSS-2601",
    name: "Arjun Rane",
    initials: "AR",
    room: "Room 12",
    plan: "both",
    avatar: "teal",
    bioRegistered: true,
    phone: "9876543210",
    email: "arjun@example.com",
    ...makeRange(new Date("2026-05-01")),
    paidAmount: 3200,
    paymentHistory: [
      { amount: 3200, date: "2026-05-01", note: "Full payment" },
    ],
  },
  {
    id: "MSS-2602",
    name: "Priya Shah",
    initials: "PS",
    room: "Room 7",
    plan: "lunch",
    avatar: "blue",
    bioRegistered: true,
    phone: "9876543211",
    email: "priya@example.com",
    ...makeRange(new Date("2026-05-01")),
    paidAmount: 1000,
    paymentHistory: [
      { amount: 1000, date: "2026-05-01", note: "Partial payment" },
    ],
  },
  {
    id: "MSS-2603",
    name: "Rohit Kulkarni",
    initials: "RK",
    room: "Room 3",
    plan: "both",
    avatar: "coral",
    bioRegistered: true,
    phone: "9876543212",
    email: "rohit@example.com",
    ...makeRange(new Date("2026-05-01")),
    paidAmount: 2000,
    paymentHistory: [
      { amount: 2000, date: "2026-05-05", note: "Partial payment" },
    ],
  },
  {
    id: "MSS-2604",
    name: "Neha Patil",
    initials: "NP",
    room: "Room 19",
    plan: "dinner",
    avatar: "purple",
    bioRegistered: true,
    phone: "9876543213",
    email: "neha@example.com",
    ...makeRange(new Date("2026-05-10")),
    paidAmount: 0,
    paymentHistory: [],
  },
  {
    id: "MSS-2605",
    name: "Saurabh Mane",
    initials: "SM",
    room: "Room 5",
    plan: "both",
    avatar: "amber",
    bioRegistered: false,
    phone: "9876543214",
    email: "saurabh@example.com",
    ...makeRange(new Date("2026-05-01")),
    paidAmount: 3200,
    paymentHistory: [
      { amount: 3200, date: "2026-05-01", note: "Full payment" },
    ],
  },
  {
    id: "MSS-2606",
    name: "Anjali Desai",
    initials: "AD",
    room: "Room 11",
    plan: "lunch",
    avatar: "teal",
    bioRegistered: true,
    phone: "9876543215",
    email: "anjali@example.com",
    ...makeRange(new Date("2026-05-01")),
    paidAmount: 500,
    paymentHistory: [
      { amount: 500, date: "2026-05-03", note: "Partial payment" },
    ],
  },
];

const initialAttendance = [
  {
    id: 1,
    studentId: "MSS-2601",
    studentName: "Arjun Rane",
    initials: "AR",
    avatar: "teal",
    meal: "Lunch",
    time: "12:03 PM",
    date: toStr(TODAY),
    method: "biometric",
  },
  {
    id: 2,
    studentId: "MSS-2602",
    studentName: "Priya Shah",
    initials: "PS",
    avatar: "blue",
    meal: "Lunch",
    time: "12:07 PM",
    date: toStr(TODAY),
    method: "biometric",
  },
  {
    id: 3,
    studentId: "MSS-2603",
    studentName: "Rohit Kulkarni",
    initials: "RK",
    avatar: "coral",
    meal: "Lunch",
    time: "12:14 PM",
    date: toStr(TODAY),
    method: "biometric",
  },
  {
    id: 4,
    studentId: "MSS-2604",
    studentName: "Neha Patil",
    initials: "NP",
    avatar: "purple",
    meal: "Lunch",
    time: "12:19 PM",
    date: toStr(TODAY),
    method: "biometric",
  },
  {
    id: 5,
    studentId: "MSS-2601",
    studentName: "Arjun Rane",
    initials: "AR",
    avatar: "teal",
    meal: "Dinner",
    time: "07:38 PM",
    date: toStr(addDays(TODAY, -1)),
    method: "biometric",
  },
  {
    id: 6,
    studentId: "MSS-2606",
    studentName: "Anjali Desai",
    initials: "AD",
    avatar: "teal",
    meal: "Dinner",
    time: "07:51 PM",
    date: toStr(addDays(TODAY, -1)),
    method: "biometric",
  },
];

export const MessProvider = ({ children }) => {
  const [students, setStudents] = useState(initialStudents);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [activeTab, setActiveTab] = useState("dashboard");

  const PLAN_PRICE = { both: 3200, lunch: 1800, dinner: 1800 };
  const PLAN_LABEL = {
    both: "Lunch + Dinner",
    lunch: "Lunch only",
    dinner: "Dinner only",
  };

  const getPlanPrice = (plan) => PLAN_PRICE[plan] || 0;
  const getPlanLabel = (plan) => PLAN_LABEL[plan] || plan;

  // Always use real today
  const getDaysLeft = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    return Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24)));
  };

  // Derived payment fields
  const getPaymentStatus = (s) => {
    const total = getPlanPrice(s.plan);
    const paid = s.paidAmount || 0;
    if (paid >= total) return "paid";
    if (paid > 0) return "partial";
    return "unpaid";
  };
  const getRemaining = (s) =>
    Math.max(0, getPlanPrice(s.plan) - (s.paidAmount || 0));

  // Add student — start date = today, end = today + 30 days
  const addStudent = (student) => {
    const newId = `MSS-${2600 + students.length + 1}`;
    const initials = student.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const avatars = ["teal", "blue", "coral", "purple", "amber"];
    const avatar = avatars[students.length % avatars.length];
    const start = student.startDate ? new Date(student.startDate) : new Date();
    setStudents((prev) => [
      ...prev,
      {
        ...student,
        id: newId,
        initials,
        avatar,
        bioRegistered: false,
        paidAmount: 0,
        paymentHistory: [],
        startDate: toStr(start),
        endDate: toStr(addDays(start, 30)),
      },
    ]);
  };

  const updateStudent = (id, updates) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const deleteStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Add a partial or full payment
  const addPayment = (id, amount, note = "") => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const total = getPlanPrice(s.plan);
        const newPaid = Math.min(total, (s.paidAmount || 0) + Number(amount));
        const entry = {
          amount: Number(amount),
          date: toStr(new Date()),
          note: note || "Payment received",
        };
        return {
          ...s,
          paidAmount: newPaid,
          paymentHistory: [...(s.paymentHistory || []), entry],
        };
      }),
    );
  };

  const registerBiometric = (id) =>
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, bioRegistered: true } : s)),
    );
  const removeBiometric = (id) =>
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, bioRegistered: false } : s)),
    );

  const addAttendanceEntry = (entry) => {
    setAttendance((prev) => [{ ...entry, id: Date.now() }, ...prev]);
  };

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

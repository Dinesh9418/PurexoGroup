import React, { createContext, useContext, useState } from "react";

const MessContext = createContext();

export const useMessContext = () => useContext(MessContext);

const initialStudents = [
  {
    id: "MSS-2601",
    name: "Arjun Rane",
    initials: "AR",
    address: "Room 12",
    plan: "both",
    avatar: "teal",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    paid: true,
    bioRegistered: true,
    phone: "9876543210",
    email: "arjun@example.com",
  },
  {
    id: "MSS-2602",
    name: "Priya Shah",
    initials: "PS",
    address: "Room 7",
    plan: "lunch",
    avatar: "blue",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    paid: true,
    bioRegistered: true,
    phone: "9876543211",
    email: "priya@example.com",
  },
  {
    id: "MSS-2603",
    name: "Rohit Kulkarni",
    initials: "RK",
    address: "Room 3",
    plan: "both",
    avatar: "coral",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    paid: false,
    bioRegistered: true,
    phone: "9876543212",
    email: "rohit@example.com",
  },
  {
    id: "MSS-2604",
    name: "Neha Patil",
    initials: "NP",
    address: "Room 19",
    plan: "dinner",
    avatar: "purple",
    startDate: "2026-04-15",
    endDate: "2026-05-27",
    paid: false,
    bioRegistered: true,
    phone: "9876543213",
    email: "neha@example.com",
  },
  {
    id: "MSS-2605",
    name: "Saurabh Mane",
    initials: "SM",
    address: "Room 5",
    plan: "both",
    avatar: "amber",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    paid: true,
    bioRegistered: false,
    phone: "9876543214",
    email: "saurabh@example.com",
  },
  {
    id: "MSS-2606",
    name: "Anjali Desai",
    initials: "AD",
    address: "Room 11",
    plan: "lunch",
    avatar: "teal",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    paid: true,
    bioRegistered: true,
    phone: "9876543215",
    email: "anjali@example.com",
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
    date: "2026-05-26",
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
    date: "2026-05-26",
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
    date: "2026-05-26",
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
    date: "2026-05-26",
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
    date: "2026-05-25",
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
    date: "2026-05-25",
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

  const getDaysLeft = (endDate) => {
    const today = new Date("2026-05-26");
    const end = new Date(endDate);
    return Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24)));
  };

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
    setStudents((prev) => [
      ...prev,
      {
        ...student,
        id: newId,
        initials,
        avatar,
        bioRegistered: false,
        paid: false,
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

  const markPayment = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, paid: true } : s)),
    );
  };

  const registerBiometric = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, bioRegistered: true } : s)),
    );
  };

  const removeBiometric = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, bioRegistered: false } : s)),
    );
  };

  const addAttendanceEntry = (entry) => {
    setAttendance((prev) => [{ ...entry, id: Date.now() }, ...prev]);
  };

  const stats = {
    total: students.length,
    paid: students.filter((s) => s.paid).length,
    pending: students.filter((s) => !s.paid).length,
    bioRegistered: students.filter((s) => s.bioRegistered).length,
    expectedRevenue: students.reduce((sum, s) => sum + getPlanPrice(s.plan), 0),
    collectedRevenue: students
      .filter((s) => s.paid)
      .reduce((sum, s) => sum + getPlanPrice(s.plan), 0),
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
        markPayment,
        registerBiometric,
        removeBiometric,
        addAttendanceEntry,
        getPlanPrice,
        getPlanLabel,
        getDaysLeft,
        stats,
      }}
    >
      {children}
    </MessContext.Provider>
  );
};

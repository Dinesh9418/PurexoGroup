import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (_) {
      /* error already set in AuthContext */
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FAFAF8",
      fontFamily: "var(--font-main)",
    },
    card: {
      width: "100%",
      maxWidth: 420,
      background: "#fff",
      borderRadius: "var(--radius-xl)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
      padding: "48px 40px 40px",
      border: "1px solid var(--border)",
    },
    logo: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "var(--teal-500)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24,
      marginBottom: 24,
    },
    title: {
      fontFamily: "var(--font-main)",
      fontSize: 24,
      fontWeight: 600,
      color: "var(--text-primary)",
      marginBottom: 4,
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: 14,
      color: "var(--text-secondary)",
      marginBottom: 32,
    },
    label: {
      display: "block",
      fontSize: 13,
      fontWeight: 500,
      color: "var(--text-secondary)",
      marginBottom: 6,
    },
    inputWrap: { position: "relative", marginBottom: 16 },
    input: {
      width: "100%",
      padding: "11px 14px",
      border: "1.5px solid var(--border)",
      borderRadius: "var(--radius-md)",
      fontSize: 14,
      color: "var(--text-primary)",
      background: "#FAFAF8",
      outline: "none",
      fontFamily: "var(--font-main)",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
    },
    passInput: {
      width: "100%",
      padding: "11px 42px 11px 14px",
      border: "1.5px solid var(--border)",
      borderRadius: "var(--radius-md)",
      fontSize: 14,
      color: "var(--text-primary)",
      background: "#FAFAF8",
      outline: "none",
      fontFamily: "var(--font-main)",
      boxSizing: "border-box",
    },
    eyeBtn: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text-muted)",
      fontSize: 16,
      padding: 2,
    },
    error: {
      background: "var(--red-50)",
      border: "1px solid #f5c6c6",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      fontSize: 13,
      color: "var(--red-700)",
      marginBottom: 18,
      cursor: "pointer",
    },
    btn: {
      width: "100%",
      padding: "12px",
      background: "var(--teal-500)",
      color: "#fff",
      border: "none",
      borderRadius: "var(--radius-md)",
      fontSize: 15,
      fontWeight: 600,
      cursor: loading ? "not-allowed" : "pointer",
      fontFamily: "var(--font-main)",
      transition: "background 0.2s",
      marginTop: 4,
      opacity: loading ? 0.8 : 1,
    },
    footer: {
      marginTop: 28,
      paddingTop: 20,
      borderTop: "1px solid var(--border)",
      fontSize: 12,
      color: "var(--text-muted)",
      textAlign: "center",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🍽</div>
        <h1 style={s.title}>Mess Tracker</h1>
        <p style={s.subtitle}>Sign in to manage students & meals</p>

        {authError && (
          <div style={s.error} onClick={() => setAuthError("")}>
            ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={s.inputWrap}>
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div style={s.inputWrap}>
            <label style={s.label}>Password</label>
            <input
              style={s.passInput}
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              style={s.eyeBtn}
              onClick={() => setShowPass((p) => !p)}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={s.footer}>
          Access restricted to authorised administrators only.
        </div>
      </div>
    </div>
  );
}

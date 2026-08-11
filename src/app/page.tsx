'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  ShieldCheck,
  Siren,
  Video,
  Sparkles,
  ChevronRight,
  Activity,
  Eye,
  EyeOff,
  UserCheck,
  Brain,
  Pill,
  MessageSquare,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { Modal } from "@/components/primitives";
import { useToast } from "@/hooks/use-toast";
import { loginPatient, loginDoctor, registerPatient } from "@/lib/services/user";

/* ══════════════════════════════════════════════════════════════
   ANIMATED VITALS CARD (hero visual)
══════════════════════════════════════════════════════════════ */

function VitalsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
      className="relative w-full max-w-sm"
      style={{ perspective: "1000px" }}
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2), rgba(168,85,247,0.15))",
          filter: "blur(20px)",
          transform: "scale(1.08)",
        }}
      />

      <div
        className="relative rounded-3xl p-6"
        style={{
          background: "rgba(10,10,24,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Live Biometric Scan
            </p>
            <p
              className="font-display text-base"
              style={{ color: "var(--text-primary)" }}
            >
              Simran Kaur
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="glow-dot-green" />
            <span className="text-[10px] font-semibold" style={{ color: "var(--accent-emerald)" }}>
              LIVE
            </span>
          </div>
        </div>

        {/* ECG Wave */}
        <div
          className="relative h-20 overflow-hidden rounded-xl mb-5"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <svg viewBox="0 0 300 80" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="30%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,40 L40,40 L55,15 L70,65 L85,40 L110,40 L120,25 L135,55 L150,40 L300,40"
              fill="none"
              stroke="url(#ecgGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </svg>
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(to right, rgba(34,211,238,0.04), transparent)",
            }}
          />
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "72", unit: "BPM", color: "#22d3ee", label: "Heart Rate" },
            { value: "99%", unit: "SpO2", color: "#10b981", label: "Oxygen" },
            { value: "120/80", unit: "mmHg", color: "#6366f1", label: "Blood Press." },
          ].map((v) => (
            <div
              key={v.unit}
              className="rounded-xl p-2.5 text-center"
              style={{
                background: `${v.color}0f`,
                border: `1px solid ${v.color}25`,
              }}
            >
              <p className="text-lg font-black leading-none" style={{ color: v.color }}>
                {v.value}
              </p>
              <p
                className="text-[9px] font-bold uppercase tracking-wider mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {v.unit}
              </p>
            </div>
          ))}
        </div>

        {/* AI Badge */}
        <div
          className="mt-4 flex items-center gap-2 rounded-xl p-2.5"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <Brain size={14} style={{ color: "#818cf8" }} />
          <span className="text-[11px] font-semibold" style={{ color: "#818cf8" }}>
            Gemini AI: All vitals within normal range
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AUTH MODAL (all logic preserved)
══════════════════════════════════════════════════════════════ */

function AuthModal({
  open,
  onClose,
  initialTab,
}: {
  open: boolean;
  onClose: () => void;
  initialTab: "patient" | "doctor" | "register";
}) {
  const [tab, setTab] = useState(initialTab);
  const { toast } = useToast();
  const router = useRouter();

  // Patient login
  const [pEmail, setPEmail] = useState("user@example.com");
  const [pPass, setPPass] = useState("user123");
  const [pShowPass, setPShowPass] = useState(false);
  const [pError, setPError] = useState("");
  const [pLoading, setPLoading] = useState(false);

  // Doctor login
  const [dEmail, setDEmail] = useState("doctor@example.com");
  const [dPass, setDPass] = useState("doc123");
  const [dError, setDError] = useState("");
  const [dLoading, setDLoading] = useState(false);

  // Register
  const [reg, setReg] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    gender: "Female",
    aadhaar: "",
    address: "",
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  async function submitPatientLogin(e: React.FormEvent) {
    e.preventDefault();
    setPError("");
    setPLoading(true);
    const res = await loginPatient(pEmail, pPass);
    setPLoading(false);
    if (!res.ok || !res.user) return setPError(res.error || "Login failed");

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sehat-session-patient",
        JSON.stringify({
          type: "patient",
          userId: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          phone: res.user.phone,
          dob: res.user.dob,
          gender: res.user.gender,
          aadhaar: res.user.aadhaar,
          address: res.user.address,
        })
      );
    }
    toast({ title: "Welcome back!", description: "Redirecting to your patient dashboard." });
    onClose();
    router.push("/dashboard");
  }

  async function submitDoctorLogin(e: React.FormEvent) {
    e.preventDefault();
    setDError("");
    setDLoading(true);
    const res = await loginDoctor(dEmail, dPass);
    setDLoading(false);
    if (!res.ok || !res.doctor) return setDError(res.error || "Login failed");

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sehat-session-doctor",
        JSON.stringify({
          type: "doctor",
          doctorId: res.doctor.id,
          email: res.doctor.email,
          fullName: res.doctor.fullName,
          specialty: res.doctor.specialty,
        })
      );
    }
    toast({ title: "Welcome Dr.!", description: "Redirecting to your doctor command center." });
    onClose();
    router.push("/doctor/dashboard");
  }

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegErrors({});
    const errs: Record<string, string> = {};
    if (!reg.fullName.trim()) errs.fullName = "Full name required";
    if (!reg.email.includes("@")) errs.email = "Valid email required";
    if (reg.password.length < 4) errs.password = "Min 4 characters";
    if (Object.keys(errs).length > 0) return setRegErrors(errs);

    setRegLoading(true);
    const res = await registerPatient(reg);
    setRegLoading(false);
    if (!res.ok || !res.user) return setRegErrors({ form: res.error || "Registration failed" });

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sehat-session-patient",
        JSON.stringify({
          type: "patient",
          userId: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          phone: res.user.phone,
          dob: res.user.dob,
          gender: res.user.gender,
          aadhaar: res.user.aadhaar,
          address: res.user.address,
        })
      );
    }
    toast({ title: "Account Created!", description: "Logging you in directly." });
    onClose();
    router.push("/dashboard");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "10px",
    border: "1px solid var(--border-bright)",
    background: "var(--surface-3)",
    padding: "10px 14px",
    fontSize: "0.875rem",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 200ms ease, box-shadow 200ms ease",
    marginTop: "4px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--text-muted)",
  };

  const tabs = [
    { key: "patient", label: "Patient Login", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    { key: "doctor", label: "Doctor Portal", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { key: "register", label: "New Account", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  ] as const;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      {/* Tab Switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-5"
        style={{ background: "var(--surface-3)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
            style={
              tab === t.key
                ? { background: t.bg, color: t.color, boxShadow: `0 0 12px ${t.bg}` }
                : { color: "var(--text-muted)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Patient Login */}
      {tab === "patient" && (
        <motion.form
          key="patient"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={submitPatientLogin}
          className="space-y-4"
        >
          <div>
            <label style={labelStyle}>Patient Email</label>
            <input
              type="email"
              value={pEmail}
              onChange={(e) => setPEmail(e.target.value)}
              style={inputStyle}
              required
              onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-bright)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <div className="relative" style={{ marginTop: 4 }}>
              <input
                type={pShowPass ? "text" : "password"}
                value={pPass}
                onChange={(e) => setPPass(e.target.value)}
                style={{ ...inputStyle, marginTop: 0, paddingRight: "40px" }}
                required
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-bright)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setPShowPass(!pShowPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {pShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {pError && (
            <p className="text-xs font-semibold" style={{ color: "var(--accent-red)" }}>
              ⚠ {pError}
            </p>
          )}

          <button
            type="submit"
            disabled={pLoading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              opacity: pLoading ? 0.7 : 1,
            }}
          >
            {pLoading ? "Signing in…" : "Sign In as Patient →"}
          </button>
        </motion.form>
      )}

      {/* Doctor Login */}
      {tab === "doctor" && (
        <motion.form
          key="doctor"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={submitDoctorLogin}
          className="space-y-4"
        >
          <div>
            <label style={labelStyle}>Doctor Email</label>
            <input
              type="email"
              value={dEmail}
              onChange={(e) => setDEmail(e.target.value)}
              style={inputStyle}
              required
              onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-bright)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={dPass}
              onChange={(e) => setDPass(e.target.value)}
              style={inputStyle}
              required
              onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-bright)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {dError && (
            <p className="text-xs font-semibold" style={{ color: "var(--accent-red)" }}>
              ⚠ {dError}
            </p>
          )}

          <button
            type="submit"
            disabled={dLoading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              boxShadow: "0 8px 24px rgba(245,158,11,0.35)",
              opacity: dLoading ? 0.7 : 1,
            }}
          >
            {dLoading ? "Signing in…" : "Sign In to Doctor Portal →"}
          </button>
        </motion.form>
      )}

      {/* Register */}
      {tab === "register" && (
        <motion.form
          key="register"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={submitRegister}
          className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"
        >
          {[
            { key: "fullName", label: "Full Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "password", label: "Password", type: "password", required: true },
            { key: "phone", label: "Phone (optional)", type: "tel", required: false },
          ].map((f) => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type={f.type}
                value={(reg as any)[f.key]}
                onChange={(e) => setReg({ ...reg, [f.key]: e.target.value })}
                style={inputStyle}
                required={f.required}
                onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-bright)"; e.target.style.boxShadow = "none"; }}
              />
              {regErrors[f.key] && (
                <p className="text-[11px] mt-1 font-semibold" style={{ color: "var(--accent-red)" }}>
                  {regErrors[f.key]}
                </p>
              )}
            </div>
          ))}

          {regErrors.form && (
            <p className="text-xs font-semibold" style={{ color: "var(--accent-red)" }}>
              ⚠ {regErrors.form}
            </p>
          )}

          <button
            type="submit"
            disabled={regLoading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all mt-1"
            style={{
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              opacity: regLoading ? 0.7 : 1,
            }}
          >
            {regLoading ? "Creating account…" : "Create Patient Account →"}
          </button>
        </motion.form>
      )}

      {/* Demo Credentials */}
      <div
        className="mt-5 rounded-xl p-3"
        style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#818cf8" }}>
          ⚡ Quick Demo Access
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { role: "Patient", email: "user@example.com", pass: "user123", color: "#818cf8" },
            { role: "Doctor", email: "doctor@example.com", pass: "doc123", color: "#fbbf24" },
          ].map((d) => (
            <div
              key={d.role}
              className="rounded-lg p-2"
              style={{ background: "var(--surface)", border: "1px solid var(--border-bright)" }}
            >
              <p className="text-[11px] font-bold" style={{ color: d.color }}>
                {d.role}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {d.email}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Pass: {d.pass}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"patient" | "doctor" | "register">("patient");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openModal = (tab: "patient" | "doctor" | "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#05050f" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          />
          <p className="text-xs font-semibold" style={{ color: "#64748b" }}>
            Initializing SEHAT…
          </p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI Symptom Checker",
      desc: "Gemini 1.5 differential diagnosis with voice input & photo analysis",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      icon: Video,
      title: "HD Video Consults",
      desc: "End-to-end WebRTC encrypted video calls with verified specialists",
      color: "#22d3ee",
      bg: "rgba(34,211,238,0.1)",
    },
    {
      icon: MessageSquare,
      title: "Instant Doctor Chat",
      desc: "Real-time encrypted messaging with online doctors 24/7",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.1)",
    },
    {
      icon: Pill,
      title: "Jan Aushadhi Finder",
      desc: "Generic drug locator with live stock alerts & pharmacy map",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      icon: ShieldCheck,
      title: "Digital Health Vault",
      desc: "Secure medical records, prescriptions & lab reports in one place",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.1)",
    },
    {
      icon: Siren,
      title: "108 Emergency Dispatch",
      desc: "National ambulance dispatch with real-time GPS ETA countdown",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
  ];

  return (
    <div
      className="min-h-screen text-[var(--text-primary)] overflow-x-hidden"
      style={{
        background: "var(--bg-root)",
        backgroundImage:
          "radial-gradient(ellipse 100% 60% at 20% -10%, rgba(99,102,241,0.12) 0%, transparent 55%)," +
          "radial-gradient(ellipse 60% 40% at 80% 110%, rgba(34,211,238,0.08) 0%, transparent 50%)",
      }}
      suppressHydrationWarning
    >
      {/* ─── NAV ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(5,5,15,0.75)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
            }}
          >
            <Stethoscope size={17} color="white" />
          </div>
          <div>
            <span className="font-display text-[17px]" style={{ color: "var(--text-primary)" }}>
              SEHAT
            </span>
            <span
              className="ml-2 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--text-muted)" }}
            >
              Telemedicine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal("patient")}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
            style={{
              border: "1px solid var(--border-bright)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            Sign In
          </button>
          <button
            onClick={() => openModal("register")}
            className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Decorative orbs */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 65%)",
            transform: "translate(20%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(34,211,238,0.08) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        {/* Dot grid */}
        <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-14 items-center">
          {/* Left copy */}
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#34d399",
                }}
              >
                <Sparkles size={12} />
                SEHAT Health Engine 3.0 — Powered by Gemini AI
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl xl:text-6xl"
              style={{ color: "var(--text-primary)", lineHeight: 1.08 }}
            >
              Digital Healthcare
              <br />
              <span className="text-gradient">for Every Indian</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
              className="text-sm sm:text-base leading-relaxed max-w-lg"
              style={{ color: "var(--text-muted)" }}
            >
              Connect with board-certified physicians instantly via HD WebRTC video, analyze symptoms
              with Gemini 1.5 AI, locate 24/7 Jan Aushadhi pharmacies, and dispatch emergency 108
              ambulances — all in one app.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => openModal("patient")}
                className="flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-bold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 12px 32px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.3)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}
              >
                Patient Portal <ChevronRight size={16} />
              </button>
              <button
                onClick={() => openModal("doctor")}
                className="flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all"
                style={{
                  border: "1px solid var(--border-bright)",
                  color: "var(--text-primary)",
                  background: "rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
                }}
              >
                <UserCheck size={16} style={{ color: "#fbbf24" }} />
                Doctor Portal
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              {[
                { icon: Lock, label: "256-bit Encrypted" },
                { icon: Globe, label: "ABDM Compliant" },
                { icon: Zap, label: "< 2s Response Time" },
              ].map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  <b.icon size={11} />
                  {b.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right visual */}
          <div className="flex justify-center">
            <VitalsCard />
          </div>
        </div>
      </section>

      {/* ─── FEATURE GRID ─────────────────────────────────── */}
      <section
        className="px-6 py-16 max-w-7xl mx-auto"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="font-display text-3xl md:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Everything healthcare{" "}
            <span className="text-gradient">in one platform</span>
          </motion.h2>
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
            Built specifically for India — multi-lingual, affordable, accessible from anywhere.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: i * 0.06 }}
              className="group relative rounded-2xl p-6 transition-all duration-300"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-bright)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.borderColor = `${f.color}40`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px ${f.color}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                style={{
                  background: f.bg,
                  color: f.color,
                  boxShadow: `0 0 20px ${f.bg}`,
                }}
              >
                <f.icon size={22} strokeWidth={1.8} />
              </span>
              <h3 className="font-bold text-[15px] mb-2" style={{ color: "var(--text-primary)" }}>
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA FOOTER ───────────────────────────────────── */}
      <section
        className="px-6 py-20 text-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <div
            className="inline-flex items-center gap-2 mb-6 rounded-full px-4 py-1.5 text-xs font-bold"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
            }}
          >
            <Activity size={12} />
            15,000+ patients served in Nabha Region
          </div>
          <h2
            className="font-display text-3xl md:text-5xl mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Start your healthcare journey{" "}
            <span className="text-gradient">today</span>
          </h2>
          <button
            onClick={() => openModal("register")}
            className="inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              boxShadow: "0 16px 40px rgba(99,102,241,0.45)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.02)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}
          >
            Create Free Account <ChevronRight size={18} />
          </button>

          <p className="mt-5 text-xs" style={{ color: "var(--text-muted)" }}>
            © 2025 SEHAT Nabha Telemedicine · Made with ❤️ for India · Powered by Google Gemini AI
          </p>
        </motion.div>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </div>
  );
}

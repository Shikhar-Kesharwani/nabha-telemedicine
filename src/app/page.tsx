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
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  MapPin,
  HeartPulse,
  Award,
} from "lucide-react";
import { Modal } from "@/components/primitives";
import { useToast } from "@/hooks/use-toast";
import { loginPatient, loginDoctor, registerPatient } from "@/lib/services/user";

/* ══════════════════════════════════════════════════════════════
   HERO INTERACTIVE PATIENT & DOCTOR CARD PREVIEW
══════════════════════════════════════════════════════════════ */

function HeroCareCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
      className="relative w-full max-w-md space-y-4"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(34,211,238,0.2), rgba(16,185,129,0.15))",
          filter: "blur(24px)",
          transform: "scale(1.05)",
        }}
      />

      {/* Main Doctor Preview Card */}
      <div
        className="relative rounded-3xl p-6 space-y-4"
        style={{
          background: "rgba(11,15,25,0.9)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-extrabold text-xl shadow-lg">
                G
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0b0f19] bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">Dr. Gurpreet Singh</h3>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Online
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--accent-cyan)]">Senior Cardiologist & Physician</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Rajindra Govt Hospital, Patiala · Lic #PB-MCI-12345</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-[#080b12] p-3 border border-[var(--border)] text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Experience</p>
            <p className="text-xs font-black text-[var(--text-primary)] mt-0.5">14 Years</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Rating</p>
            <p className="text-xs font-black text-amber-400 mt-0.5">4.9 ⭐ (187)</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Fee</p>
            <p className="text-xs font-black text-emerald-400 mt-0.5">₹500</p>
          </div>
        </div>

        {/* Live Patient Sehat Card Badge */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🦁</span>
            <div>
              <p className="text-[11px] font-bold text-emerald-400">Punjab Sehat Card (MMSBY)</p>
              <p className="text-[10px] text-[var(--text-muted)]">Cashless Care up to ₹10 Lakhs</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            ACTIVE
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AUTHENTICATION MODAL
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
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setPError("");
    setDError("");
    setRegError("");
  }, [initialTab, open]);

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPError("");
    setPLoading(true);
    try {
      const res = await loginPatient(pEmail, pPass);
      if (res.ok && res.user) {
        localStorage.setItem("sehat-session-patient", JSON.stringify({ userId: res.user.id, ...res.user }));
        toast({ title: "Welcome back!", description: `Logged in as ${res.user.fullName}` });
        onClose();
        router.push("/dashboard");
      } else {
        setPError(res.error || "Login failed");
      }
    } catch {
      setPError("An error occurred during authentication.");
    } finally {
      setPLoading(false);
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDError("");
    setDLoading(true);
    try {
      const res = await loginDoctor(dEmail, dPass);
      if (res.ok && res.doctor) {
        localStorage.setItem("sehat-session-doctor", JSON.stringify({ doctorId: res.doctor.id, ...res.doctor }));
        toast({ title: "Welcome Doctor!", description: `Logged in as ${res.doctor.fullName}` });
        onClose();
        router.push("/doctor/dashboard");
      } else {
        setDError(res.error || "Doctor login failed");
      }
    } catch {
      setDError("An error occurred during authentication.");
    } finally {
      setDLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!reg.fullName || !reg.email || !reg.password) {
      setRegError("Please fill in all required fields.");
      return;
    }
    setRegLoading(true);
    try {
      const res = await registerPatient(reg);
      if (res.ok && res.user) {
        localStorage.setItem("sehat-session-patient", JSON.stringify({ userId: res.user.id, ...res.user }));
        toast({ title: "Registration Successful! 🎉", description: `Account created for ${res.user.fullName}` });
        onClose();
        router.push("/dashboard");
      } else {
        setRegError(res.error || "Registration failed");
      }
    } catch {
      setRegError("Failed to register. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-black shadow-lg mb-2">
            <Stethoscope size={22} />
          </div>
          <h2 className="font-display text-2xl text-[var(--text-primary)]">
            SEHAT <span className="text-gradient">Nabha</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)]">Access your healthcare portal & medical vault</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--surface-2)] p-1 border border-[var(--border)]">
          {[
            { key: "patient", label: "Patient Sign In" },
            { key: "doctor", label: "Doctor Portal" },
            { key: "register", label: "New Account" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as any)}
              className={`rounded-xl py-2 text-xs font-bold transition-all ${
                tab === t.key
                  ? "bg-[var(--accent-indigo)] text-white shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Patient Login */}
        {tab === "patient" && (
          <form onSubmit={handlePatientLogin} className="space-y-4">
            {pError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-bold">
                {pError}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Email Address</label>
              <input
                type="email"
                value={pEmail}
                onChange={(e) => setPEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Password</label>
              <div className="relative mt-1">
                <input
                  type={pShowPass ? "text" : "password"}
                  value={pPass}
                  onChange={(e) => setPPass(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPShowPass(!pShowPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  {pShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={pLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50"
            >
              {pLoading ? "Signing in..." : "Sign In to Patient Portal"}
            </button>

            <div className="pt-2 border-t border-[var(--border)] text-center">
              <button
                type="button"
                onClick={async () => {
                  setPLoading(true);
                  const res = await loginPatient("user@example.com", "user123");
                  if (res.ok && res.user) {
                    localStorage.setItem("sehat-session-patient", JSON.stringify({ userId: res.user.id, ...res.user }));
                    toast({ title: "Demo Patient Session Active!", description: "Logged in as Harjinder Singh" });
                    onClose();
                    router.push("/dashboard");
                  }
                  setPLoading(false);
                }}
                className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all"
              >
                ⚡ 1-Click Patient Demo Login (Harjinder Singh)
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Doctor Login */}
        {tab === "doctor" && (
          <form onSubmit={handleDoctorLogin} className="space-y-4">
            {dError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-bold">
                {dError}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Doctor Email</label>
              <input
                type="email"
                value={dEmail}
                onChange={(e) => setDEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Password</label>
              <input
                type="password"
                value={dPass}
                onChange={(e) => setDPass(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={dLoading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 py-3 text-xs font-bold text-black shadow-lg shadow-amber-500/25 hover:opacity-95 disabled:opacity-50"
            >
              {dLoading ? "Authenticating Doctor..." : "Access Doctor Dashboard"}
            </button>

            <div className="pt-2 border-t border-[var(--border)] text-center">
              <button
                type="button"
                onClick={async () => {
                  setDLoading(true);
                  const res = await loginDoctor("doctor@example.com", "doc123");
                  if (res.ok && res.doctor) {
                    localStorage.setItem("sehat-session-doctor", JSON.stringify({ doctorId: res.doctor.id, ...res.doctor }));
                    toast({ title: "Demo Doctor Session Active!", description: "Logged in as Dr. Gurpreet Singh, MD" });
                    onClose();
                    router.push("/doctor/dashboard");
                  }
                  setDLoading(false);
                }}
                className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
              >
                ⚡ 1-Click Doctor Demo Login (Dr. Gurpreet Singh)
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Register */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {regError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-bold">
                {regError}
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Full Name *</label>
              <input
                type="text"
                value={reg.fullName}
                onChange={(e) => setReg({ ...reg, fullName: e.target.value })}
                required
                placeholder="e.g. Harjinder Singh"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Email Address *</label>
              <input
                type="email"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Password *</label>
              <input
                type="password"
                value={reg.password}
                onChange={(e) => setReg({ ...reg, password: e.target.value })}
                required
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Phone Number</label>
              <input
                type="text"
                value={reg.phone}
                onChange={(e) => setReg({ ...reg, phone: e.target.value })}
                placeholder="+91 98145 00000"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Address (Nabha Tehsil)</label>
              <input
                type="text"
                value={reg.address}
                onChange={(e) => setReg({ ...reg, address: e.target.value })}
                placeholder="e.g. Model Town, Nabha, Punjab"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={regLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 disabled:opacity-50 mt-2"
            >
              {regLoading ? "Creating Account..." : "Create Patient Account"}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"patient" | "doctor" | "register">("patient");

  const openModal = (tab: "patient" | "doctor" | "register") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleConsultationClick = () => {
    const patientSession = typeof window !== 'undefined' ? localStorage.getItem('sehat-session-patient') : null;
    if (patientSession) {
      router.push('/doctor-chat');
    } else {
      openModal('patient');
    }
  };

  const handleDoctorPortalClick = () => {
    const doctorSession = typeof window !== 'undefined' ? localStorage.getItem('sehat-session-doctor') : null;
    if (doctorSession) {
      router.push('/doctor/dashboard');
    } else {
      openModal('doctor');
    }
  };

  const features = [
    {
      icon: Stethoscope,
      title: "Doctor Consultations",
      desc: "Connect with certified physicians from Rajindra Hospital Patiala & SDH Civil Hospital Nabha via WebRTC Video/Voice.",
      color: "#22d3ee",
      bg: "rgba(34,211,238,0.1)",
    },
    {
      icon: Building2,
      title: "Civil Hospital OPD Guide",
      desc: "Daily schedules for all 10 departments at Lt. Gen. Shivdev Singh SDH Civil Hospital Nabha with token advice.",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      icon: Pill,
      title: "Jan Aushadhi Generic Finder",
      desc: "Locate generic medicine inventory at local Nabha stores and calculate brand-to-generic savings up to 90%.",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      icon: Siren,
      title: "108 Emergency Ambulance",
      desc: "National ambulance dispatch with real-time GPS radar, agricultural chemical emergency guides, and helpline buttons.",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
    {
      icon: ShieldCheck,
      title: "Sehat Card & Health Vault",
      desc: "Store diagnostic reports, digital e-prescriptions, and Ayushman Bharat MMSBY cashless health coverage details.",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.1)",
    },
    {
      icon: HeartPulse,
      title: "Regional Symptom Triage",
      desc: "Interactive diagnostic checker tuned for Punjab's health conditions supporting English, Hindi, and Gurmukhi Punjabi.",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.1)",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 overflow-x-hidden font-sans" suppressHydrationWarning>
      {/* Top Government Scheme Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-indigo-950 to-emerald-950 border-b border-emerald-500/20 py-2.5 px-4 text-center text-xs font-bold text-emerald-300">
        🏛️ Empanelled under Ayushman Bharat Mukh Mantri Sehat Bima Yojana (MMSBY) · Cashless Treatment up to ₹10 Lakhs/Year
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#050810]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-extrabold shadow-lg">
            <Stethoscope size={20} />
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-white">SEHAT</span>
            <span className="ml-2 text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Nabha</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("patient")}
            className="rounded-xl px-4 py-2 text-xs font-bold border border-white/10 text-slate-200 hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => openModal("register")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-extrabold text-cyan-400">
              <Building2 size={14} /> Local Healthcare Partner · Nabha Tehsil & Patiala District
            </div>

            <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-black leading-tight text-white">
              Complete Healthcare <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                for Nabha Region
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Connect with certified doctors from Rajindra Hospital Patiala & SDH Civil Hospital Nabha, locate Jan Aushadhi generic stores, and manage your family&apos;s health records in one place.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleConsultationClick}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all cursor-pointer"
              >
                Consult a Doctor <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleDoctorPortalClick}
                className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-3.5 text-sm font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <UserCheck size={16} /> Doctor Portal
              </button>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
              <div>
                <p className="font-black text-lg text-white">15,000+</p>
                <p className="text-slate-400">Nabha Residents</p>
              </div>
              <div>
                <p className="font-black text-lg text-emerald-400">100+ Free</p>
                <p className="text-slate-400">Civil Hospital Tests</p>
              </div>
              <div>
                <p className="font-black text-lg text-cyan-400">108 Hotline</p>
                <p className="text-slate-400">Emergency Dispatch</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <HeroCareCard />
          </div>
        </div>
      </section>

      {/* Primary Healthcare Services Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Integrated Medical Care</span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
            Designed for Local Healthcare Needs
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Combining regional hospital networks with low-cost generic pharmacies and government welfare coverage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-[#0a0f1d] p-6 space-y-4 hover:border-white/20 transition-all"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold"
                style={{ backgroundColor: f.bg, color: f.color }}
              >
                <f.icon size={22} />
              </div>
              <h3 className="font-bold text-base text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Local Hospital Partners Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 space-y-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Empanelled Regional Hospitals & Referral Hubs</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { name: "Lt. Gen. Shivdev Singh SDH", city: "Civil Hospital Nabha" },
            { name: "Rajindra Govt Hospital", city: "Patiala (28 km)" },
            { name: "Homi Bhabha Cancer Centre", city: "Sangrur (38 km)" },
            { name: "Vardaan Multispeciality", city: "Nabha" },
          ].map((h, idx) => (
            <div key={idx} className="rounded-2xl border border-white/5 bg-[#0a0f1d] p-4 space-y-1">
              <p className="font-bold text-xs text-white">{h.name}</p>
              <p className="text-[11px] text-slate-400">{h.city}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Local Patient Feedback</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Trusted by Families in Nabha</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#0a0f1d] p-6 space-y-3">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;Got my routine diabetes and BP medicines from Jan Aushadhi Kendra right outside Civil Hospital Nabha. Saved over ₹1,200 monthly compared to market prices.&rdquo;
            </p>
            <div>
              <p className="font-bold text-xs text-white">Harjinder Singh</p>
              <p className="text-[11px] text-slate-400">Model Town, Nabha</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0a0f1d] p-6 space-y-3">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;Booked a video consultation with Dr. Gurpreet Singh at Rajindra Hospital without traveling 28 km to Patiala or standing in long OPD queues.&rdquo;
            </p>
            <div>
              <p className="font-bold text-xs text-white">Simran Kaur</p>
              <p className="text-[11px] text-slate-400">Guru Nanak Pura, Nabha</p>
            </div>
          </div>
        </div>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
    </div>
  );
}

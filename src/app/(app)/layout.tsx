'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  HeartPulse,
  MessageSquare,
  FileText,
  Video,
  Mic,
  Pill,
  MapPin,
  Siren,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Languages,
  LogOut,
  ChevronDown,
  Stethoscope,
  Mic as MicIcon,
  MicOff,
  Sparkles,
  Bell,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AvatarWithRing } from "@/components/primitives";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { I18nextProvider } from "react-i18next";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, accent: "indigo" },
  { label: "Profile", path: "/profile", icon: User, accent: "indigo" },
  { label: "Appointments", path: "/appointments", icon: CalendarDays, accent: "cyan" },
  { label: "Symptom Checker", path: "/symptom-checker", icon: HeartPulse, accent: "emerald", badge: "AI" },
  { label: "Doctor Chat", path: "/doctor-chat", icon: MessageSquare, accent: "violet" },
  { label: "Health Records", path: "/health-records", icon: FileText, accent: "amber" },
  { label: "Video Call", path: "/video-call", icon: Video, accent: "cyan" },
  { label: "Voice Call", path: "/voice-call", icon: Mic, accent: "violet" },
  { label: "Medicine Finder", path: "/medicine-finder", icon: Pill, accent: "emerald" },
  { label: "Pharmacies", path: "/pharmacy-locator", icon: MapPin, accent: "emerald" },
  { label: "Ambulance Nearby", path: "/ambulance-nearby", icon: Siren, accent: "red" },
] as const;

const accentColors: Record<string, { text: string; bg: string; hex: string; glow: string }> = {
  indigo: { text: "#818cf8", bg: "rgba(99,102,241,0.12)", hex: "#6366f1", glow: "rgba(99,102,241,0.3)" },
  cyan: { text: "#67e8f9", bg: "rgba(34,211,238,0.12)", hex: "#22d3ee", glow: "rgba(34,211,238,0.3)" },
  violet: { text: "#c084fc", bg: "rgba(168,85,247,0.12)", hex: "#a855f7", glow: "rgba(168,85,247,0.3)" },
  emerald: { text: "#34d399", bg: "rgba(16,185,129,0.12)", hex: "#10b981", glow: "rgba(16,185,129,0.3)" },
  amber: { text: "#fbbf24", bg: "rgba(245,158,11,0.12)", hex: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  red: { text: "#f87171", bg: "rgba(239,68,68,0.12)", hex: "#ef4444", glow: "rgba(239,68,68,0.3)" },
};

function getSession() {
  if (typeof window === 'undefined') return null;
  const patientSession = localStorage.getItem('sehat-session-patient');
  if (patientSession) return { type: 'patient', ...JSON.parse(patientSession) };
  const doctorSession = localStorage.getItem('sehat-session-doctor');
  if (doctorSession) return { type: 'doctor', ...JSON.parse(doctorSession) };
  return null;
}

function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sehat-session-patient');
  localStorage.removeItem('sehat-session-doctor');
}

/* ── SIDEBAR ─────────────────────────────────────────────── */

function Sidebar({ collapsed, mobileOpen, onCloseMobile }: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.fullName) {
      setUser({ fullName: session.fullName, email: session.email });
    } else {
      router.replace('/');
    }
  }, [router]);

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn("flex items-center gap-3 py-5 px-4 shrink-0", collapsed && "justify-center px-2")}
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.3)",
          }}
        >
          <Stethoscope size={17} color="white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display text-[15px]" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              SEHAT
            </p>
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>
              Telemedicine
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          const active = pathname === item.path || pathname.startsWith(item.path + "/");
          const Icon = item.icon;
          const ac = accentColors[item.accent] || accentColors.indigo;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0 py-3"
              )}
              style={
                active
                  ? {
                      background: ac.bg,
                      color: ac.text,
                      boxShadow: `inset 0 0 0 1px ${ac.glow}, 0 0 12px ${ac.glow}`,
                    }
                  : {
                      color: "var(--text-muted)",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }
              }}
            >
              {/* Active indicator bar */}
              {active && !collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: ac.hex }}
                />
              )}

              <Icon
                size={17}
                strokeWidth={2.2}
                className="shrink-0"
                style={active ? { color: ac.hex } : {}}
              />

              {!collapsed && <span className="truncate flex-1">{item.label}</span>}

              {!collapsed && "badge" in item && item.badge && (
                <span
                  className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase"
                  style={{
                    background: "rgba(16,185,129,0.2)",
                    color: "#34d399",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User zone */}
      <div
        className={cn("shrink-0 p-2", collapsed && "flex justify-center")}
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {collapsed ? (
          <AvatarWithRing name={user?.fullName || "U"} size={36} />
        ) : (
          <div className="relative">
            <button
              className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-all duration-200"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <AvatarWithRing name={user?.fullName || "U"} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {user?.fullName || "Patient"}
                </p>
                <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {user?.email || "user@sehat.in"}
                </p>
              </div>
              <ChevronDown
                size={13}
                style={{ color: "var(--text-muted)", transform: userMenuOpen ? "rotate(180deg)" : "", transition: "transform 200ms ease" }}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute bottom-full left-0 mb-2 w-full rounded-xl p-1.5 z-50"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-bright)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    <User size={14} />
                    My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all"
                    style={{ color: "var(--accent-red)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 z-30 flex-col transition-[width] duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {content}
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(5,5,15,0.8)", backdropFilter: "blur(8px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[240px] md:hidden"
              style={{
                background: "var(--surface)",
                borderRight: "1px solid var(--border-bright)",
              }}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "tween", duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── VOICE COMMAND BUTTON ────────────────────────────────── */

const VOICE_ROUTES: { keywords: string[]; path: string }[] = [
  { keywords: ["appointment", "book doctor"], path: "/appointments" },
  { keywords: ["symptom", "diagnosis"], path: "/symptom-checker" },
  { keywords: ["ambulance", "emergency"], path: "/ambulance-nearby" },
  { keywords: ["medicine", "pharmacy"], path: "/medicine-finder" },
  { keywords: ["health record", "vault"], path: "/health-records" },
  { keywords: ["dashboard", "home"], path: "/dashboard" },
  { keywords: ["profile"], path: "/profile" },
  { keywords: ["chat"], path: "/doctor-chat" },
];

function VoiceCommandButton() {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const supported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!supported) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript.toLowerCase();
      const match = VOICE_ROUTES.find((r) => r.keywords.some((k) => transcript.includes(k)));
      if (match) router.push(match.path);
    };
    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      disabled={!supported}
      title={
        supported
          ? "Voice commands: try 'appointments' or 'emergency'"
          : "Voice not supported"
      }
      aria-label="Voice assistant"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all"
      style={{
        border: `1px solid ${listening ? "rgba(239,68,68,0.5)" : "var(--border-bright)"}`,
        background: listening ? "rgba(239,68,68,0.1)" : "transparent",
        color: listening ? "var(--accent-red)" : "var(--text-muted)",
        opacity: !supported ? 0.4 : 1,
      }}
    >
      {listening && <span className="pulse-ring" style={{ color: "var(--accent-red)" }} />}
      {listening ? <MicIcon size={15} /> : <MicOff size={15} />}
    </button>
  );
}

/* ── LANGUAGE LABELS ─────────────────────────────────────── */

const LANGUAGE_LABELS: Record<string, string> = {
  en: "EN",
  hi: "हि",
  pa: "ਪੰਜ",
};

/* ── HEADER ──────────────────────────────────────────────── */

function Header({
  onToggleSidebar,
  onOpenMobile,
}: {
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
}) {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<string>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const current = NAV_ITEMS.find(
    (i) => pathname === i.path || pathname.startsWith(i.path + "/")
  );
  const Icon = current?.icon || LayoutDashboard;
  const ac = current ? accentColors[current.accent] : accentColors.indigo;

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.removeAttribute("data-theme");
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 md:px-6"
      style={{
        background: "rgba(5,5,15,0.8)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Sidebar toggle — desktop */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all"
        style={{ color: "var(--text-muted)", border: "1px solid var(--border-bright)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
      >
        <PanelLeftClose size={16} />
      </button>

      {/* Mobile toggle */}
      <button
        onClick={onOpenMobile}
        aria-label="Open menu"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all"
        style={{ color: "var(--text-muted)", border: "1px solid var(--border-bright)" }}
      >
        <PanelLeftOpen size={16} />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{ background: ac.bg, color: ac.text, boxShadow: `0 0 14px ${ac.glow}` }}
        >
          <Icon size={15} strokeWidth={2.2} />
        </span>
        <h1
          className="truncate font-display text-[15px] sm:text-base"
          style={{ color: "var(--text-primary)" }}
        >
          {current?.label || "SEHAT"}
        </h1>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <VoiceCommandButton />

        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all"
            style={{
              border: "1px solid var(--border-bright)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
          >
            <Languages size={14} />
            <span>{LANGUAGE_LABELS[lang] || "EN"}</span>
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-32 rounded-xl p-1.5 z-50"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-bright)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                }}
              >
                {Object.keys(LANGUAGE_LABELS).map((code) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); i18n.changeLanguage(code); setLangOpen(false); }}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-all"
                    style={{
                      color: lang === code ? "var(--accent-indigo-bright)" : "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                  >
                    {code === "en" ? "English" : code === "hi" ? "हिन्दी" : "ਪੰਜਾਬੀ"}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all"
          style={{ border: "1px solid var(--border-bright)", color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}

/* ── ROOT LAYOUT ─────────────────────────────────────────── */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen" style={{ background: "var(--bg-root)" }}>
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div
          className={cn("transition-[margin] duration-300 ease-in-out", collapsed ? "md:ml-[60px]" : "md:ml-[240px]")}
        >
          <Header
            onToggleSidebar={() => setCollapsed((v) => !v)}
            onOpenMobile={() => setMobileOpen(true)}
          />
          <motion.main
            key={pathname}
            className="px-4 py-6 md:px-8 md:py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </I18nextProvider>
  );
}

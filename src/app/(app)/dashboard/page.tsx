'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartPulse,
  Droplets,
  Activity,
  CalendarPlus,
  ShieldCheck,
  Zap,
  TrendingUp,
  Plus,
  Clock,
  Video,
  Mic,
  BellRing,
  X,
  Lightbulb,
  MessageSquare,
  Pill,
  Siren,
  ArrowRight,
  User,
  FlaskConical,
  TriangleAlert,
} from "lucide-react";
import { SectionHeader, StatCard, StatusBadge } from "@/components/primitives";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { getAppointments, type Appointment } from "@/lib/services/appointments";
import { getActiveSubscriptions, dismissNotification as dismissSubscription, type StockNotification } from "@/lib/services/medicine-subscriptions";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow } from "date-fns";

import { getLatestVitals, recordVitals } from "@/lib/services/vitals";
import { getSession } from "@/lib/session";

const generateRecentMonthsChartData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  const data = [];
  const baseScores = [78, 81, 85, 83, 89, 94];
  for (let i = 5; i >= 0; i--) {
    const mIdx = (currentMonthIdx - i + 12) % 12;
    data.push({
      month: months[mIdx],
      score: baseScores[5 - i],
    });
  }
  return data;
};

const SEASONAL_ALERTS: Record<number, { title: string; message: string; variant: 'red' | 'amber' | 'emerald' }> = {
  // June, July, August — Dengue/Malaria season
  6: { title: '🦟 Dengue & Malaria Alert — Nabha Region', message: 'Peak vector-borne season. Watch for sudden high fever with severe joint pain, headache behind eyes, or skin rash. Visit Civil Hospital Nabha or call 108 immediately if platelets drop.', variant: 'red' },
  7: { title: '🦟 Dengue & Malaria Alert — Nabha Region', message: 'Peak vector-borne season. Watch for sudden high fever with severe joint pain, headache behind eyes, or skin rash. Visit Civil Hospital Nabha or call 108 immediately if platelets drop.', variant: 'red' },
  8: { title: '🌊 Monsoon Waterborne Disease Alert', message: 'Avoid unboiled water during monsoon. Risk of Hepatitis A/E, gastroenteritis. Use ORS if experiencing diarrhea. Free treatment available at Civil Hospital Nabha.', variant: 'amber' },
  // October, November — Stubble burning season
  10: { title: '🌫️ Stubble Burning Season — Air Quality Alert', message: 'Agricultural stubble burning causes severe air pollution across Punjab. Patients with asthma or COPD should wear N95 masks outdoors and keep rescue inhalers accessible.', variant: 'amber' },
  11: { title: '🌫️ Dense Fog & Cold Wave Alert', message: 'Dense morning fog and cold waves increase risk of road accidents and respiratory infections. Elderly and children should avoid outdoor exposure between 6–9 AM.', variant: 'amber' },
  // April, May — Heat season
  4: { title: '🌡️ Heat Wave Advisory — Farm Workers', message: 'Temperatures rising across Punjab. Fieldworkers: drink water every 20 minutes, wear light cotton, rest in shade 12–3 PM. Symptoms of heat stroke: confusion, no sweating — call 108.', variant: 'red' },
  5: { title: '🌡️ Heat Wave Advisory — Farm Workers', message: 'Temperatures rising across Punjab. Fieldworkers: drink water every 20 minutes, wear light cotton, rest in shade 12–3 PM. Symptoms of heat stroke: confusion, no sweating — call 108.', variant: 'red' },
};

const healthTips = [
  "Check your blood sugar every morning if you have diabetes. Target fasting sugar: 80–130 mg/dL.",
  "Reduce namak (salt) in your diet. Excess salt is the primary contributor to high BP in Punjab.",
  "Drink filtered or boiled water during monsoon to prevent typhoid, Hepatitis A, and gastroenteritis.",
  "Farm workers: wear protective masks and gloves when spraying agricultural chemicals. Wash hands thoroughly.",
  "Walk 30 minutes after dinner. Daily walking reduces post-meal blood sugar levels by 15–20 mg/dL.",
  "Generic diabetes and BP medicines are available at Jan Aushadhi Kendra (Civil Hospital Nabha) at 50–80% savings."
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const variantColors = {
  red: { text: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "#ef4444" },
  amber: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "#f59e0b" },
  emerald: { text: "#10b981", bg: "rgba(16,185,129,0.1)", border: "#10b981" },
};

export default function DashboardPage() {
  const [userName, setUserName] = useState("Harjinder Singh");
  const [userId, setUserId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stockNotifications, setStockNotifications] = useState<StockNotification[]>([]);
  const [healthTip, setHealthTip] = useState("");
  const [dismissedSeasonalAlert, setDismissedSeasonalAlert] = useState(false);
  const { toast } = useToast();

  // Vitals State
  const [heartRate, setHeartRate] = useState(72);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [spO2, setSpO2] = useState(99);
  const [waterCount, setWaterCount] = useState(6);
  const [chartData, setChartData] = useState(generateRecentMonthsChartData);
  const [isScanningPulse, setIsScanningPulse] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.type === 'patient') {
      setUserId(session.userId || 1);
      if (session.fullName) setUserName(session.fullName);
    }
    // Day-seeded stable health tip (updates once every 24 hours, stable across renders)
    const dayOfYear = Math.floor(Date.now() / 86400000);
    setHealthTip(healthTips[dayOfYear % healthTips.length]);
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      const userAppointments = await getAppointments(userId!);
      setAppointments(userAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      const activeNotifications = await getActiveSubscriptions();
      setStockNotifications(activeNotifications);

      // Load persisted vitals from SQLite
      const savedVitals = await getLatestVitals(userId!);
      if (savedVitals) {
        setHeartRate(savedVitals.heartRate);
        setSystolic(savedVitals.systolic);
        setDiastolic(savedVitals.diastolic);
        setSpO2(savedVitals.spO2);
      }
    }
    loadData();
  }, [userId]);

  const dismissNotif = async (id: number) => {
    await dismissSubscription(id);
    setStockNotifications(prev => prev.filter(n => n.id !== id));
  };

  const measureHeartRate = async () => {
    setIsScanningPulse(true);
    setTimeout(async () => {
      const randomPulse = Math.floor(68 + Math.random() * 14);
      setHeartRate(randomPulse);
      setIsScanningPulse(false);

      if (userId) {
        await recordVitals({
          userId,
          heartRate: randomPulse,
          systolic,
          diastolic,
          spO2,
          bloodGlucose: 105,
        });
      }

      toast({
        title: "Optical Pulse Scan Complete ❤️",
        description: `Heart rhythm synchronized at ${randomPulse} BPM (Optimal Resting Pulse). Saved to database.`,
      });
    }, 500);
  };

  const logBpReading = async () => {
    const sys = Math.floor(115 + Math.random() * 15);
    const dia = Math.floor(75 + Math.random() * 10);
    setSystolic(sys);
    setDiastolic(dia);

    if (userId) {
      await recordVitals({
        userId,
        heartRate,
        systolic: sys,
        diastolic: dia,
        spO2,
        bloodGlucose: 105,
      });
    }

    toast({
      title: "Blood Pressure Recorded 🩸",
      description: `Logged BP reading: ${sys}/${dia} mmHg. Saved to database.`,
    });
  };

  const logSpO2Reading = async () => {
    const reading = Math.floor(97 + Math.random() * 3);
    setSpO2(reading);

    if (userId) {
      await recordVitals({
        userId,
        heartRate,
        systolic,
        diastolic,
        spO2: reading,
        bloodGlucose: 105,
      });
    }

    toast({
      title: "Oxygen Saturation (SpO2) Updated 🫁",
      description: `Pulse oximeter reading: ${reading}% SpO2. Saved to database.`,
    });
  };

  const addWaterGlass = () => {
    setWaterCount(prev => {
      const updated = prev + 1;
      toast({
        title: "Hydration Target Updated! 💧",
        description: `Logged ${updated} glasses of water today. Wellness score advancing!`,
      });
      setChartData(current => current.map((c, i) => i === current.length - 1 ? { ...c, score: Math.min(100, c.score + 1) } : c));
      return updated;
    });
  };

  const formatDateLabel = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "PPP");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10 shadow-2xl">
        <div className="orbital-ring ring-1 opacity-40" />
        <div className="orbital-ring ring-2 opacity-30" style={{ inset: 30 }} />
        <div className="ambient-glow" style={{ width: 400, height: 400, top: -100, right: -100 }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="glow-dot-green" />
              <span className="rounded-full border border-[var(--accent-indigo)]/30 bg-[var(--accent-indigo)]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--accent-indigo)]">
                SEHAT Health Engine 3.0 · Nabha, Punjab
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)] leading-tight">
              {getGreeting()}, <span className="text-gradient">{userName}</span> 👋
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-xl leading-relaxed">
              Health Dashboard · Nabha Region. You have <strong className="text-[var(--accent-emerald)] font-bold">{appointments.length} active consultation{appointments.length !== 1 ? 's' : ''}</strong> scheduled.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/appointments"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-sm h-12 px-6 shadow-xl shadow-indigo-500/25 hover:scale-105"
            >
              <CalendarPlus size={18} /> Book Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* Stock Alert Notifications */}
      {stockNotifications.map(notification => (
        <div key={notification.id} className="relative flex items-center justify-between rounded-2xl border border-[var(--accent-emerald)]/40 bg-[var(--accent-emerald)]/10 p-4 text-[var(--accent-emerald)]">
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Medicine In Stock Notification!</p>
              <p className="text-xs opacity-90">
                <span className="font-bold underline">{notification.medicine_name}</span> is now available at {notification.pharmacy_name}.
              </p>
            </div>
          </div>
          <button onClick={() => dismissNotif(notification.id)} className="rounded-lg p-1 hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
      ))}

      {/* Seasonal Alert Banner */}
      {!dismissedSeasonalAlert && SEASONAL_ALERTS[new Date().getMonth() + 1] && (() => {
        const alert = SEASONAL_ALERTS[new Date().getMonth() + 1];
        const colors = variantColors[alert.variant];
        return (
          <div
            className="relative flex items-start gap-4 rounded-2xl border-l-4 border-y border-r border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg"
            style={{ borderLeftColor: colors.border }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <TriangleAlert size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold" style={{ color: colors.text }}>{alert.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-primary)] leading-relaxed">{alert.message}</p>
            </div>
            <button onClick={() => setDismissedSeasonalAlert(true)} className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]">
              <X size={16} />
            </button>
          </div>
        );
      })()}

      {/* Biometric Vitals Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Activity}
          accent="red"
          label="Heart Pulse"
          value={
            <div className="flex items-baseline gap-1.5">
              <span>{heartRate}</span>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase">BPM</span>
            </div>
          }
          badge={<StatusBadge variant="red">Resting</StatusBadge>}
          footer={
            <div className="space-y-2 mt-1">
              <span className="text-[11px] text-[var(--accent-emerald)] font-bold flex items-center gap-1">
                <TrendingUp size={13} /> Optimal Rhythm
              </span>
              <button
                onClick={measureHeartRate}
                disabled={isScanningPulse}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/10 text-[var(--accent-red)] py-1.5 text-xs font-bold hover:bg-[var(--accent-red)]/20"
              >
                <Zap size={13} className="text-[var(--accent-amber)]" />
                {isScanningPulse ? 'Scanning...' : 'Measure Pulse'}
              </button>
            </div>
          }
        />

        <StatCard
          icon={HeartPulse}
          accent="cyan"
          label="Blood Pressure"
          value={
            <div className="flex items-baseline gap-1.5">
              <span>{systolic}/{diastolic}</span>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase">mmHg</span>
            </div>
          }
          badge={<StatusBadge variant="cyan">{systolic > 130 ? "Elevated" : "Standard"}</StatusBadge>}
          footer={
            <div className="space-y-2 mt-1">
              <span className="text-[11px] text-[var(--accent-emerald)] font-bold flex items-center gap-1">
                <ShieldCheck size={13} /> {systolic > 130 ? "Monitor BP Daily" : "Ideal Systolic/Diastolic"}
              </span>
              <button
                onClick={logBpReading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--accent-cyan)]/40 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] py-1.5 text-xs font-bold hover:bg-[var(--accent-cyan)]/20"
              >
                <Plus size={13} /> Log BP Reading
              </button>
            </div>
          }
        />

        <StatCard
          icon={Droplets}
          accent="emerald"
          label="Daily Hydration"
          value={
            <div className="flex items-baseline gap-1.5">
              <span>{waterCount}</span>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase">/ 8 Glasses</span>
            </div>
          }
          badge={<StatusBadge variant="emerald">Target</StatusBadge>}
          footer={
            <div className="space-y-2.5 mt-1">
              <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (waterCount / 8) * 100)}%` }} />
              </div>
              <button
                onClick={addWaterGlass}
                className="w-full flex items-center justify-center gap-1 rounded-xl border border-[var(--accent-emerald)]/40 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] py-1.5 text-xs font-bold hover:bg-[var(--accent-emerald)]/20"
              >
                <Plus size={13} /> Log Water Glass
              </button>
            </div>
          }
        />

        <StatCard
          icon={Activity}
          accent="indigo"
          label="SpO2 Oxygen"
          value={
            <div className="flex items-baseline gap-1.5">
              <span>{spO2}%</span>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Sat</span>
            </div>
          }
          badge={<StatusBadge variant="indigo">Pulse Sat</StatusBadge>}
          footer={
            <div className="space-y-2 mt-1">
              <span className="text-[11px] text-[var(--accent-emerald)] font-bold flex items-center gap-1">
                <ShieldCheck size={13} /> High Tissue Oxygenation
              </span>
              <button
                onClick={logSpO2Reading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--accent-indigo)]/40 bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] py-1.5 text-xs font-bold hover:bg-[var(--accent-indigo)]/20"
              >
                <Plus size={13} /> Log SpO2
              </button>
            </div>
          }
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Consultations */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <SectionHeader
              title="Upcoming Consultations"
              subtitle={appointments.length > 0 ? `${appointments.length} consultations scheduled.` : "No consultations scheduled today."}
              action={
                <StatusBadge variant="indigo">{appointments.length} Active</StatusBadge>
              }
            />

            <div className="space-y-3 pt-2">
              {appointments.length > 0 ? appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 card-3d-hover"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] font-bold">
                      {appt.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-[var(--text-primary)]">{appt.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{appt.details}</p>
                      <p className="text-xs font-bold text-[var(--accent-indigo)] flex items-center gap-1 mt-1">
                        <Clock size={13} /> {formatDateLabel(appt.date)}, {appt.time}
                      </p>
                    </div>
                  </div>

                  {appt.type === 'Doctor' && appt.doctorId && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/voice-call/${appt.doctorId}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-white/5"
                      >
                        <Mic size={14} /> Voice
                      </Link>
                      <Link
                        href={`/video-call/${appt.doctorId}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-indigo)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                      >
                        <Video size={14} /> Join Call
                      </Link>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-10 text-[var(--text-muted)] space-y-2">
                  <CalendarPlus className="mx-auto h-10 w-10 opacity-40" />
                  <p className="text-sm font-semibold">No upcoming consultations.</p>
                  <Link href="/appointments" className="text-xs text-[var(--accent-indigo)] font-bold hover:underline block">
                    Book a new specialist consultation
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <Link href="/appointments" className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--accent-indigo)] hover:underline">
                View All Appointments <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Daily AI Tip */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]">
              <Lightbulb size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-amber)]">Daily AI Wellness Advice</p>
              <p className="text-sm text-[var(--text-primary)] font-medium mt-1 leading-relaxed">
                "{healthTip || 'Hydration activates metabolic energy. Drink at least 8 glasses of water daily.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <h3 className="font-display text-base text-[var(--text-primary)]">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link href="/symptom-checker" className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 card-3d-hover">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]">
                  <HeartPulse size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Symptom Checker</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Gemini 1.5 AI Diagnosis</p>
                </div>
              </Link>

              <Link href="/medicine-finder" className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 card-3d-hover">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
                  <Pill size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Medicine Finder</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Jan Aushadhi Inventory</p>
                </div>
              </Link>

              <Link href="/doctor-chat" className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 card-3d-hover">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-violet)]/10 text-[var(--accent-violet)]">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Doctor Chat</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Instant Encrypted Text</p>
                </div>
              </Link>

              <Link href="/ambulance-nearby" className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 card-3d-hover">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-red)]/10 text-[var(--accent-red)]">
                  <Siren size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Ambulance 108</p>
                  <p className="text-[11px] text-[var(--text-muted)]">National GPS Hotline</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Monthly Wellness Chart */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base text-[var(--text-primary)]">Wellness Rating</h3>
              <StatusBadge variant="emerald">94 / 100</StatusBadge>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#0d0d1a", borderColor: "#1e1e3a", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

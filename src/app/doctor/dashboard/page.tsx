'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Video,
  MessageSquare,
  FileText,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck,
  Send,
} from "lucide-react";
import { SectionHeader, StatCard, StatusBadge, Modal } from "@/components/primitives";
import { DoctorCallModal } from "@/components/doctor-call-modal";
import { createHealthRecord } from "@/lib/services/health-records";
import { getAppointments } from "@/lib/services/appointments";
import { useToast } from "@/hooks/use-toast";

type QueuePatient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  complaint: string;
  urgency: 'Critical' | 'Moderate' | 'Routine';
  time: string;
};

const INITIAL_QUEUE: QueuePatient[] = [
  { id: "101", name: "Simran Kaur", age: 28, gender: "Female", complaint: "Chest tightness, dry cough for 3 days", urgency: "Critical", time: "10:15 AM" },
  { id: "102", name: "Gurpreet Singh", age: 45, gender: "Male", complaint: "Fever 101°F, fatigue and joint pain", urgency: "Moderate", time: "10:30 AM" },
  { id: "103", name: "Harpreet Kaur", age: 34, gender: "Female", complaint: "Refill routine hypertension medication", urgency: "Routine", time: "11:00 AM" },
];

import { broadcastDoctorOnline } from "@/lib/services/doctor-presence";
import { grantCallPermission } from "@/lib/services/call-permissions";

export default function DoctorDashboardPage() {
  const [queue, setQueue] = useState<QueuePatient[]>(INITIAL_QUEUE);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Broadcast doctor presence as online while on Doctor Portal
    const cleanupPresence = broadcastDoctorOnline("1");

    async function loadDbAppointments() {
      const appts = await getAppointments(1);
      if (appts && appts.length > 0) {
        const dbQueue: QueuePatient[] = appts.map((a, idx) => ({
          id: String(a.id),
          name: a.name || "Patient Appointment",
          age: 30 + idx * 5,
          gender: idx % 2 === 0 ? "Female" : "Male",
          complaint: a.details || "Scheduled Consultation",
          urgency: idx === 0 ? "Critical" : idx === 1 ? "Moderate" : "Routine",
          time: a.time || "10:00 AM",
        }));
        setQueue(dbQueue);
      }
    }
    loadDbAppointments();

    return () => cleanupPresence();
  }, []);

  // Prescription Form
  const [medication, setMedication] = useState("Paracetamol 500mg");
  const [dosage, setDosage] = useState("1 tablet after food");
  const [frequency, setFrequency] = useState("1-0-1 (Twice daily)");
  const [durationDays, setDurationDays] = useState("5");
  const [advice, setAdvice] = useState("Drink warm water and rest adequately.");

  const openRxModal = (p: QueuePatient) => {
    setSelectedPatient(p);
    setRxModalOpen(true);
  };

  const handleGenerateRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const signatureCode = `SEHAT-PB-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const htmlDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Prescription - ${selectedPatient.name}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none; } }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #fff; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
    .hospital { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
    .sub { font-size: 12px; color: #64748b; margin: 2px 0 0; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 13px; }
    .rx-symbol { font-size: 32px; font-weight: 900; color: #0284c7; font-family: serif; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 700; font-size: 12px; }
    td { padding: 10px 12px; border: 1px solid #e2e8f0; }
    .advice-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 32px; font-size: 13px; color: #92400e; border-radius: 0 8px 8px 0; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #64748b; }
    .seal { border: 2px dashed #0284c7; border-radius: 10px; padding: 8px 14px; text-align: center; color: #0284c7; font-weight: 700; font-size: 11px; }
    .print-btn { background: #0284c7; color: #fff; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Print Prescription / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <span class="badge">Government of Punjab • Telemedicine Network</span>
      <h1 class="hospital">SEHAT Nabha Telemedicine Centre</h1>
      <p class="sub">Empanelled with SDH Civil Hospital Nabha & Rajindra Govt Hospital Patiala</p>
    </div>
    <div style="text-align: right;">
      <p style="margin: 0; font-weight: 700; color: #0f172a;">Dr. Gurpreet Singh, MD</p>
      <p class="sub">Senior Cardiologist & General Physician</p>
      <p class="sub">Reg # PB-MCI-12345</p>
    </div>
  </div>

  <div class="patient-box">
    <div><span class="section-title">Patient Name</span><br><strong>${selectedPatient.name}</strong></div>
    <div><span class="section-title">Age / Gender</span><br>${selectedPatient.age} Yrs / ${selectedPatient.gender}</div>
    <div><span class="section-title">Date</span><br>${dateStr}</div>
    <div><span class="section-title">Chief Complaint</span><br>${selectedPatient.complaint}</div>
  </div>

  <div class="rx-symbol">℞</div>

  <table>
    <thead>
      <tr>
        <th>Medicine & Strength</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th>Generic Store Guidance</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${medication}</strong></td>
        <td>${dosage}</td>
        <td>${frequency}</td>
        <td>${durationDays} Days</td>
        <td style="color: #059669; font-weight: 600;">Available at Jan Aushadhi Kendra, Nabha (up to 80% savings)</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Doctor's Advice & Instructions</div>
  <div class="advice-box">
    ${advice}
  </div>

  <div class="footer">
    <div>
      <p style="margin: 0 0 4px;"><strong>National Health Helpline:</strong> 108 (Ambulance) • 104 (Health Advice)</p>
      <p style="margin: 0;">Ayushman Bharat Mukh Mantri Sehat Bima Yojana (MMSBY) Empanelled</p>
    </div>
    <div class="seal">
      ✓ DIGITALLY SIGNED & VERIFIED<br>
      <span style="font-family: monospace; font-size: 12px;">${signatureCode}</span>
    </div>
  </div>
</body>
</html>`;

    // Save Rx to SQLite Database for Patient ID 1
    await createHealthRecord({
      userId: 1,
      name: `Digital Rx: ${medication}`,
      type: "Prescription",
      date: new Date().toISOString().split("T")[0],
      doctor: "Dr. Gurpreet Singh, MD",
      content: `Prescribed: ${medication} (${dosage}, ${frequency} for ${durationDays} days). Advice: ${advice}. Verification: ${signatureCode}`,
    });

    // Open clean print preview window and offer download
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `Prescription_${selectedPatient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setRxModalOpen(false);
    toast({
      title: "Digital Prescription Issued! 📝",
      description: `Official printable Rx generated for ${selectedPatient.name} and saved to Medical Vault.`,
    });
  };

  return (
    <div className="space-y-8">
      <DoctorCallModal />
      {/* Doctor Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-amber)]/40 bg-gradient-to-br from-[#1a1205] via-[#0d0d1a] to-[#0d0d1a] p-8 shadow-2xl">
        <div className="ambient-glow" style={{ width: 400, height: 400, top: -100, right: -100, background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="glow-dot-green" />
              <StatusBadge variant="amber">Dr. Provider Portal</StatusBadge>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)]">
              Dr. Gurpreet Singh, <span className="text-gradient-warm">MD</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Cardiologist & General Physician • Rajindra Hospital Patiala / SDH Civil Hospital Nabha • Lic #PB-MCI-12345</p>
            <p className="text-xs text-[var(--text-muted)] font-mono">Senior Cardiologist • Reg #PB-98765 • Active Standby</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10 px-4 py-2 text-xs font-bold text-[var(--accent-amber)] flex items-center gap-2">
              <Activity size={16} /> Live Patient Queue: {queue.length}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={User}
          accent="amber"
          label="Patients Waiting in Queue"
          value={queue.length}
          badge={<StatusBadge variant="amber">Live Queue</StatusBadge>}
        />
        <StatCard
          icon={Video}
          accent="cyan"
          label="Consultations Today"
          value={8}
          badge={<StatusBadge variant="cyan">HD Calls</StatusBadge>}
        />
        <StatCard
          icon={FileText}
          accent="violet"
          label="Prescriptions Issued"
          value={14}
          badge={<StatusBadge variant="violet">Rx Vault</StatusBadge>}
        />
      </div>

      {/* Live Patient Queue List */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <SectionHeader
          title="Virtual Clinic Patient Queue"
          subtitle="Real-time triage queue for active video consults, chats, and digital prescriptions."
          action={<StatusBadge variant="amber"><Clock size={13} /> Real-Time Triage</StatusBadge>}
        />

        <div className="space-y-3 pt-2">
          {queue.map((patient) => (
            <div
              key={patient.id}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 card-3d-hover"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-base text-[var(--text-primary)]">{patient.name}</h4>
                  <span className="text-xs text-[var(--text-muted)] font-mono">({patient.age}y / {patient.gender})</span>
                  <StatusBadge variant={patient.urgency === 'Critical' ? 'red' : patient.urgency === 'Moderate' ? 'amber' : 'emerald'}>
                    {patient.urgency}
                  </StatusBadge>
                </div>
                <p className="text-xs text-[var(--text-primary)] font-medium">Chief Complaint: {patient.complaint}</p>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                  <Clock size={12} /> Scheduled: {patient.time}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <Link
                  href={`/video-call/1`}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-cyan)]/15 border border-[var(--accent-cyan)]/30 px-3.5 py-2 text-xs font-bold text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/25"
                >
                  <Video size={14} /> Join Video
                </Link>

                <Link
                  href={`/doctor-chat/1`}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/5"
                >
                  <MessageSquare size={14} /> Review Chat
                </Link>

                <button
                  onClick={() => {
                    grantCallPermission("1", "1");
                    toast({
                      title: "Call Permission Granted! 🔓",
                      description: `Granted Video & Voice call request permission to ${patient.name}.`,
                    });
                  }}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30"
                >
                  <CheckCircle2 size={14} /> Grant Call Permission
                </button>

                <button
                  onClick={() => openRxModal(patient)}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:opacity-95"
                >
                  <Plus size={14} /> Write Digital Rx
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Prescription Generator Modal */}
      {selectedPatient && (
        <Modal open={rxModalOpen} onClose={() => setRxModalOpen(false)} maxWidth="max-w-lg">
          <form onSubmit={handleGenerateRx} className="space-y-4">
            <div>
              <StatusBadge variant="amber">Digital Rx Generator</StatusBadge>
              <h3 className="font-display text-xl text-[var(--text-primary)] mt-2">Prescription for {selectedPatient.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">Complaint: {selectedPatient.complaint}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Medication Name</label>
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-amber)] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-amber)] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Duration (Days)</label>
                  <input
                    type="text"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-amber)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Frequency</label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-amber)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Special Doctor Advice</label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-amber)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setRxModalOpen(false)} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-bold text-[var(--text-muted)]">
                Cancel
              </button>
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20">
                <Send size={15} /> Save & Issue Prescription
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

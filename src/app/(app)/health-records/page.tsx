'use client';

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Plus,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { SectionHeader, StatCard, StatusBadge, Modal } from "@/components/primitives";
import { getHealthRecords, createHealthRecord, type HealthRecord } from "@/lib/services/health-records";
import { useToast } from "@/hooks/use-toast";

function getSession() {
  if (typeof window === 'undefined') return null;
  const patientSession = localStorage.getItem('sehat-session-patient');
  if (patientSession) return { type: 'patient', ...JSON.parse(patientSession) };
  return null;
}

export default function HealthRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [labTestName, setLabTestName] = useState("Complete Blood Count (CBC)");
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const session = getSession();
    if (session?.type === 'patient') {
      setUserId(session.userId || 1);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      const fetched = await getHealthRecords(userId!);
      setRecords(fetched);
    }
    loadData();
  }, [userId]);

  const categories = ["All", "Prescription", "Lab Report", "Diagnostic", "Vaccination"];

  const filtered = category === "All" ? records : records.filter(r => r.type === category);

  const downloadRecord = (rec: HealthRecord) => {
    const content = rec.content || `================================================
          NABHA TELEMEDICINE (SEHAT)
             DIGITAL HEALTH RECORD
================================================
Record Name: ${rec.name}
Category:    ${rec.type}
Date:        ${rec.date}
Provider:    ${rec.doctor}

DETAILS / CONTENT:
${rec.content || 'Official digital health record stored securely in SEHAT Medical Vault.'}
================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sehat_Record_${rec.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded Record", description: `Saved ${rec.name} to your device.` });
  };

  const handleBookLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const newRecord = {
      userId: userId,
      name: `Lab Booking: ${labTestName}`,
      type: "Diagnostic" as const,
      date: new Date().toISOString().split("T")[0],
      doctor: "Nabha Central Diagnostics",
      content: `Diagnostic Lab Test (${labTestName}) booked. Sample collection scheduled at Nabha Central Diagnostics.`,
    };

    await createHealthRecord(newRecord);
    const updated = await getHealthRecords(userId);
    setRecords(updated);
    setLabModalOpen(false);

    toast({
      title: "Lab Test Booked! 🧪",
      description: `Scheduled ${labTestName}. Added confirmation to your vault.`,
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Medical Vault & Health Records"
        subtitle="End-to-end encrypted storage for digital prescriptions, diagnostic lab reports, and vaccination certificates."
        action={
          <button
            onClick={() => setLabModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:opacity-95"
          >
            <Plus size={15} /> Book Lab Test
          </button>
        }
      />

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={FileText}
          accent="amber"
          label="Total Records Stored"
          value={records.length}
          badge={<StatusBadge variant="amber">Encrypted Vault</StatusBadge>}
        />
        <StatCard
          icon={Clock}
          accent="indigo"
          label="Last Record Added"
          value={records[0]?.date || "None"}
          badge={<StatusBadge variant="indigo">Verified</StatusBadge>}
        />
        <StatCard
          icon={FlaskConical}
          accent="emerald"
          label="Lab Diagnostics"
          value={records.filter(r => r.type === "Lab Report" || r.type === "Diagnostic").length}
          badge={<StatusBadge variant="emerald">Diagnostics</StatusBadge>}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              category === cat
                ? "bg-[var(--accent-amber)] text-black shadow-md"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Records Table List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--text-muted)]">
            No health records found matching category &quot;{category}&quot;.
          </div>
        ) : (
          filtered.map(rec => (
            <div
              key={rec.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-3d-hover"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[var(--text-primary)]">{rec.name}</h4>
                    <StatusBadge variant="amber">{rec.type}</StatusBadge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Provider: <span className="text-[var(--text-primary)] font-medium">{rec.doctor}</span> • Date: {rec.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedRecord(rec)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/5"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => downloadRecord(rec)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:opacity-95"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Record Preview Modal */}
      {selectedRecord && (
        <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)} maxWidth="max-w-lg">
          <div className="space-y-4">
            <div>
              <StatusBadge variant="amber">{selectedRecord.type}</StatusBadge>
              <h3 className="font-display text-xl text-[var(--text-primary)] mt-2">{selectedRecord.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Provider: {selectedRecord.doctor} • Date: {selectedRecord.date}</p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4 font-mono text-xs text-[var(--text-primary)] leading-relaxed space-y-2 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedRecord.content || "Official health document stored securely in SEHAT Vault."}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => downloadRecord(selectedRecord)} className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-amber)] px-4 py-2 text-xs font-bold text-black">
                <Download size={14} /> Download File
              </button>
              <button onClick={() => setSelectedRecord(null)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-muted)]">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Book Lab Test Modal */}
      <Modal open={labModalOpen} onClose={() => setLabModalOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleBookLabTest} className="space-y-4">
          <div>
            <h3 className="font-display text-lg text-[var(--text-primary)]">Book Diagnostic Lab Test</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Sample collection at Nabha Central Diagnostics.</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Test</label>
            <select
              value={labTestName}
              onChange={(e) => setLabTestName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-amber)] focus:outline-none"
            >
              <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
              <option value="Lipid Profile (Cholesterol)">Lipid Profile (Cholesterol)</option>
              <option value="HbA1c Diabetes Screening">HbA1c Diabetes Screening</option>
              <option value="Thyroid Function Test (T3/T4/TSH)">Thyroid Function Test (T3/T4/TSH)</option>
              <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setLabModalOpen(false)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-muted)]">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md">
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

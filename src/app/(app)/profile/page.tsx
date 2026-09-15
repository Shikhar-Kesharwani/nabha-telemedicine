'use client';

import { useState, useEffect } from "react";
import { User, ShieldCheck, Heart, Phone, MapPin, Save, Calendar, FileText } from "lucide-react";
import { SectionHeader, StatCard, StatusBadge, AvatarWithRing } from "@/components/primitives";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/services/user";
import { getSession, type SessionUser } from "@/lib/session";

export default function ProfilePage() {
  const { toast } = useToast();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  const [form, setForm] = useState({
    fullName: "Harjinder Singh",
    email: "user@example.com",
    phone: "+91 98765 43210",
    dob: "1988-08-15",
    gender: "Male",
    aadhaar: "XXXX-XXXX-8821",
    address: "Model Town, Nabha, Punjab 147201",
    bloodGroup: "O+",
    allergies: "Penicillin, Dust Mites",
    chronicConditions: "Type 2 Diabetes",
    sehatCardNo: "PB-SEHAT-99481",
    emergencyContactName: "Gurpreet Kaur",
    emergencyContactPhone: "+91 98145 00112",
  });

  useEffect(() => {
    const session = getSession();
    if (session?.type === 'patient') {
      setSessionUser(session);
      setForm((prev) => {
        let contactName = session.emergencyContactName || prev.emergencyContactName;
        let contactPhone = session.emergencyContactPhone || prev.emergencyContactPhone;
        if (!session.emergencyContactName && session.emergencyContact) {
          const match = session.emergencyContact.match(/^(.*?)\s*\((.*?)\)$/);
          if (match) {
            contactName = match[1].trim();
            contactPhone = match[2].trim();
          } else {
            contactPhone = session.emergencyContact;
          }
        }

        return {
          ...prev,
          fullName: session.fullName || prev.fullName,
          email: session.email || prev.email,
          phone: session.phone || prev.phone,
          dob: session.dob || prev.dob,
          gender: session.gender || prev.gender,
          aadhaar: session.aadhaar || prev.aadhaar,
          address: session.address || prev.address,
          bloodGroup: session.bloodGroup || prev.bloodGroup,
          allergies: session.allergies || prev.allergies,
          chronicConditions: session.chronicConditions || prev.chronicConditions,
          sehatCardNo: session.sehatCardNo || prev.sehatCardNo,
          emergencyContactName: contactName,
          emergencyContactPhone: contactPhone,
        };
      });
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionUser?.userId) {
      await updateUserProfile(sessionUser.userId, {
        fullName: form.fullName,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        aadhaar: form.aadhaar,
        address: form.address,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies,
        chronicConditions: form.chronicConditions,
        sehatCardNo: form.sehatCardNo,
        emergencyContact: `${form.emergencyContactName} (${form.emergencyContactPhone})`,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
      });

      localStorage.setItem('sehat-session-patient', JSON.stringify({
        ...sessionUser,
        fullName: form.fullName,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        aadhaar: form.aadhaar,
        address: form.address,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies,
        chronicConditions: form.chronicConditions,
        sehatCardNo: form.sehatCardNo,
        emergencyContact: `${form.emergencyContactName} (${form.emergencyContactPhone})`,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
      }));
    }

    toast({
      title: "Profile & Medical Records Updated! 💾",
      description: "Personal health profile and Sehat Card details saved to database.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
        <div className="ambient-glow" style={{ width: 350, height: 350, top: -50, right: -50 }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <AvatarWithRing name={form.fullName} size={80} orbital={true} />
          <div className="text-center sm:text-left space-y-1">
            <h1 className="font-display text-2xl sm:text-4xl text-[var(--text-primary)]">{form.fullName}</h1>
            <p className="text-xs text-[var(--text-muted)] font-mono">{form.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <StatusBadge variant="emerald"><ShieldCheck size={13} /> Verified Aadhaar Patient</StatusBadge>
              <StatusBadge variant="cyan">ABHA ID: 91-8842-1092-3841</StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Punjab Sehat Card (MMSBY) & ABHA Digital Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-emerald)]/40 bg-gradient-to-br from-[#04170d] via-[#0d0d1a] to-[#0a1820] p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
              🦁
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent-emerald)]">Government of Punjab Healthcare Scheme</span>
              <h3 className="font-display text-lg font-black text-[var(--text-primary)]">Ayushman Bharat Mukh Mantri Sehat Bima Yojana</h3>
              <p className="text-xs text-[var(--text-muted)]">Cashless Treatment up to ₹10 Lakhs/Year for Family</p>
            </div>
          </div>
          <span className="self-start sm:self-center rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-[var(--accent-emerald)]">
            ACTIVE COVERAGE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-3 space-y-1">
            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Sehat Card Number</p>
            <p className="font-mono font-bold text-sm text-[var(--accent-emerald)]">{form.sehatCardNo}</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-3 space-y-1">
            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">ABHA Health Address</p>
            <p className="font-mono font-bold text-sm text-[var(--accent-cyan)]">{form.fullName.toLowerCase().replace(/\s+/g, '')}@abdm</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-black/40 p-3 space-y-1">
            <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Empanelled Nabha Hospital</p>
            <p className="font-bold text-xs text-[var(--text-primary)]">Civil Hospital SDH Nabha & Vardaan Hospital</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={Heart}
          accent="red"
          label="Blood Group"
          value={form.bloodGroup}
          badge={<StatusBadge variant="red">Emergency Card</StatusBadge>}
        />
        <StatCard
          icon={Phone}
          accent="amber"
          label="Emergency Contact"
          value={form.emergencyContactPhone}
          badge={<StatusBadge variant="amber">{form.emergencyContactName}</StatusBadge>}
        />
        <StatCard
          icon={FileText}
          accent="indigo"
          label="Allergies Flagged"
          value={form.allergies ? "2 Active" : "None"}
          badge={<StatusBadge variant="indigo">Allergy Monitor</StatusBadge>}
        />
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <h3 className="font-display text-lg text-[var(--text-primary)] border-b border-[var(--border)] pb-3">Personal & Medical Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Aadhaar Number (Masked)</label>
            <input
              type="text"
              value={form.aadhaar}
              onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Blood Group</label>
            <select
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            >
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Known Drug Allergies</label>
            <input
              type="text"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Chronic Conditions</label>
            <input
              type="text"
              value={form.chronicConditions}
              onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Sehat Card / Ayushman Card No.</label>
            <input
              type="text"
              value={form.sehatCardNo}
              onChange={(e) => setForm({ ...form, sehatCardNo: e.target.value })}
              placeholder="e.g. PB-SEHAT-99481"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-indigo)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95"
          >
            <Save size={16} /> Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}

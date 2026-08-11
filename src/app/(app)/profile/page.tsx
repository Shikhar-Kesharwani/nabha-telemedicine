'use client';

import { useState, useEffect } from "react";
import { User, ShieldCheck, Heart, Phone, MapPin, Save, Calendar, FileText } from "lucide-react";
import { SectionHeader, StatCard, StatusBadge, AvatarWithRing } from "@/components/primitives";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/services/user";

function getSession() {
  if (typeof window === 'undefined') return null;
  const patientSession = localStorage.getItem('sehat-session-patient');
  if (patientSession) return { type: 'patient', ...JSON.parse(patientSession) };
  return null;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [form, setForm] = useState({
    fullName: "Jane Smith",
    email: "user@example.com",
    phone: "+91 98765 43210",
    dob: "1994-08-15",
    gender: "Female",
    aadhaar: "XXXX-XXXX-8821",
    address: "Model Town, Nabha, Punjab 147201",
    bloodGroup: "O+",
    allergies: "Penicillin, Dust Mites",
    chronicConditions: "Mild Asthma",
    emergencyContactName: "Gurpreet Smith",
    emergencyContactPhone: "+91 98111 22233",
  });

  useEffect(() => {
    const session = getSession();
    if (session?.type === 'patient') {
      setSessionUser(session);
      setForm((prev) => ({
        ...prev,
        fullName: session.fullName || prev.fullName,
        email: session.email || prev.email,
        phone: session.phone || prev.phone,
        dob: session.dob || prev.dob,
        gender: session.gender || prev.gender,
        aadhaar: session.aadhaar || prev.aadhaar,
        address: session.address || prev.address,
      }));
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
      });

      localStorage.setItem('sehat-session-patient', JSON.stringify({
        ...sessionUser,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
      }));
    }

    toast({
      title: "Profile Updated!",
      description: "Personal & medical history preferences saved to vault.",
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
            <div className="pt-2">
              <StatusBadge variant="emerald"><ShieldCheck size={13} /> Verified Aadhaar Patient</StatusBadge>
            </div>
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

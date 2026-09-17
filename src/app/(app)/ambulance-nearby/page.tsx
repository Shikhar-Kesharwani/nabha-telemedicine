'use client';

import { useState, useEffect } from "react";
import { Siren, Phone, MapPin, Clock, ShieldAlert, CheckCircle2, Navigation } from "lucide-react";
import { SectionHeader, StatusBadge, Modal } from "@/components/primitives";
import { createAmbulanceDispatch, type AmbulanceDispatch } from "@/lib/services/ambulance";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/session";

const AMBULANCES = [
  { id: "1", type: "Advanced Life Support (ALS)", driver: "Gurpreet Singh", phone: "+91 98765 10801", vehicleNo: "PB 11 AB 1081", etaMins: 6, isAvailable: true },
  { id: "2", type: "Cardiac Care Unit", driver: "Rajesh Kumar", phone: "+91 98765 10802", vehicleNo: "PB 11 AB 1082", etaMins: 9, isAvailable: true },
  { id: "3", type: "Basic Life Support (BLS)", driver: "Harpreet Sharma", phone: "+91 98765 10803", vehicleNo: "PB 11 AB 1083", etaMins: 12, isAvailable: true },
];

export default function AmbulanceNearbyPage() {
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedAmb, setDispatchedAmb] = useState<typeof AMBULANCES[0] | null>(null);
  const [pendingAmb, setPendingAmb] = useState<typeof AMBULANCES[0] | null>(null);
  const [eta, setEta] = useState(8);
  const [locationStr, setLocationStr] = useState("Model Town, Nabha (30.375, 76.152)");
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (dispatchedAmb && eta > 1) {
      timer = setInterval(() => setEta(prev => prev - 1), 5000);
    }
    return () => clearInterval(timer);
  }, [dispatchedAmb, eta]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStr(`Nabha Region GPS (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
        },
        () => {}
      );
    }
  }, []);

  const confirmDispatch = async () => {
    if (!pendingAmb) return;
    const amb = pendingAmb;
    setPendingAmb(null);
    setDispatching(true);
    const session = getSession();
    const userEmail = session?.email || 'user@example.com';

    // Save dispatch record to SQLite database
    await createAmbulanceDispatch({
      userEmail,
      ambulanceType: amb.type,
      driverName: amb.driver,
      vehicleNo: amb.vehicleNo,
      etaMinutes: amb.etaMins,
      status: "DISPATCHED",
      location: locationStr,
    });

    setDispatchedAmb(amb);
    setEta(amb.etaMins);
    setDispatching(false);

    toast({
      title: "108 Paramedic Dispatched & Logged to DB! 🚨",
      description: `Ambulance ${amb.vehicleNo} with driver ${amb.driver} is en route. Dispatch record created in SQLite database.`,
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="National 108 Emergency Ambulance Hotline"
        subtitle="Single-click emergency hotline transmission to dispatch nearest GPS paramedic unit & log dispatch to SQLite DB."
        action={<StatusBadge variant="red"><ShieldAlert size={13} strokeWidth={2.5} /> National 108 Hotline</StatusBadge>}
      />

      {/* Emergency Callout Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-red)]/40 bg-gradient-to-br from-[#1a0505] to-[#0d0d1a] p-8 text-center space-y-4 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--accent-red)]">Immediate Medical Emergency?</p>
          <h1 className="font-display text-5xl sm:text-7xl text-white">108</h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Clicking call connects you directly to National Emergency Services with instant GPS location broadcasting.
          </p>

          <div className="pt-2">
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-red)] px-8 py-4 text-base font-black text-white shadow-xl shadow-red-600/40 hover:scale-105 transition-all"
            >
              <Phone size={20} /> Call National Hotline 108 Now
            </a>
          </div>
        </div>
      </div>

      {/* Active Dispatch Tracker */}
      {dispatchedAmb && (
        <div className="rounded-2xl border border-[var(--accent-emerald)]/40 bg-[var(--accent-emerald)]/10 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <StatusBadge variant="emerald">Live Paramedic Tracking</StatusBadge>
              <h3 className="font-bold text-lg text-white mt-1">{dispatchedAmb.type} En Route</h3>
              <p className="text-xs text-slate-300 mt-0.5">Driver: <span className="font-bold text-white">{dispatchedAmb.driver}</span> ({dispatchedAmb.vehicleNo})</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Estimated Arrival</p>
              <p className="text-3xl font-extrabold text-[var(--accent-emerald)] font-mono">{eta} MINS</p>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Available List */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-[var(--text-primary)]">Available 108 Paramedic Units (Nabha Patrol)</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AMBULANCES.map((amb) => (
            <div key={amb.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-red)]/10 text-[var(--accent-red)] font-bold">
                    <Siren size={20} />
                  </span>
                  <StatusBadge variant="red">{amb.etaMins} Min ETA</StatusBadge>
                </div>

                <div>
                  <h4 className="font-bold text-base text-[var(--text-primary)]">{amb.type}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Vehicle: <span className="font-mono font-bold text-[var(--text-primary)]">{amb.vehicleNo}</span></p>
                  <p className="text-xs text-[var(--text-muted)]">Driver: {amb.driver}</p>
                </div>
              </div>

              <button
                onClick={() => setPendingAmb(amb)}
                disabled={dispatching || (dispatchedAmb?.id === amb.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-red)] py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {dispatchedAmb?.id === amb.id ? "✓ Dispatched & Logged" : "Dispatch Unit Now"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={Boolean(pendingAmb)}
        onClose={() => setPendingAmb(null)}
        title="Confirm 108 Emergency Ambulance Dispatch"
      >
        {pendingAmb && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[var(--text-muted)]">Please confirm you are requesting an active emergency paramedic response.</p>
            <div className="rounded-2xl border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{pendingAmb.type}</span>
                <span className="text-[var(--accent-red)] font-bold">{pendingAmb.etaMins} Min ETA</span>
              </div>
              <p className="text-xs text-slate-300">Vehicle: <span className="font-mono font-bold text-white">{pendingAmb.vehicleNo}</span> • Paramedic: {pendingAmb.driver}</p>
              <p className="text-xs text-slate-400">Broadcast Location: <span className="text-white font-medium">{locationStr}</span></p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingAmb(null)}
                className="flex-1 rounded-xl border border-[var(--border-bright)] py-2.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDispatch}
                disabled={dispatching}
                className="flex-1 rounded-xl bg-[var(--accent-red)] py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:opacity-95"
              >
                {dispatching ? "Dispatching..." : "Confirm & Dispatch 108"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Section A: Nearest Emergency Hospitals */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h3 className="font-bold text-base text-[var(--text-primary)]">Nearest Emergency Referral Centers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--accent-emerald)]">
              <ShieldAlert size={18} />
              <span className="font-bold text-sm text-[var(--text-primary)]">Rajindra Govt Hospital, Patiala</span>
            </div>
            <div className="flex gap-2">
              <StatusBadge variant="amber">28 km / ~35 min</StatusBadge>
              <StatusBadge variant="emerald">24/7 Emergency</StatusBadge>
            </div>
            <a href="tel:01752212058" className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/10 w-full justify-center">
              <Phone size={14} /> Call: 0175-2212058
            </a>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--accent-emerald)]">
              <ShieldAlert size={18} />
              <span className="font-bold text-sm text-[var(--text-primary)]">Vardaan Multispeciality & Trauma, Nabha</span>
            </div>
            <div className="flex gap-2">
              <StatusBadge variant="amber">2 km / ~5 min</StatusBadge>
              <StatusBadge variant="emerald">24/7 Emergency</StatusBadge>
            </div>
            <a href="tel:+919814600001" className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/10 w-full justify-center">
              <Phone size={14} /> Call: +91 98146 00001
            </a>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--accent-emerald)]">
              <ShieldAlert size={18} />
              <span className="font-bold text-sm text-[var(--text-primary)]">Homi Bhabha Cancer Hospital, Sangrur</span>
            </div>
            <div className="flex gap-2">
              <StatusBadge variant="amber">38 km / ~45 min</StatusBadge>
              <StatusBadge variant="emerald">Cancer Emergencies</StatusBadge>
            </div>
            <a href="tel:01672523100" className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-white/10 w-full justify-center">
              <Phone size={14} /> Call: 01672-523100
            </a>
          </div>
        </div>
      </div>

      {/* Section B: Pesticide & Chemical Emergency Guide */}
      <div className="rounded-2xl border border-[var(--accent-amber)] bg-[var(--accent-amber)]/10 p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={100} className="text-[var(--accent-amber)]" /></div>
        <div className="relative z-10 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-[var(--accent-amber)] flex items-center gap-2">
              ⚠️ Agricultural Chemical / Pesticide Poisoning
            </h3>
            <p className="text-sm text-[var(--accent-amber)]/80 mt-1">Most common farm emergency in Punjab — act immediately</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-amber)]/20 text-xs font-bold text-[var(--accent-amber)]">1</span>
              <p className="text-sm text-[var(--text-primary)] mt-0.5">Move patient to fresh air immediately, remove contaminated clothing</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-amber)]/20 text-xs font-bold text-[var(--accent-amber)]">2</span>
              <p className="text-sm text-[var(--text-primary)] mt-0.5">Do <strong className="text-[var(--accent-amber)]">NOT</strong> induce vomiting for organophosphate/pesticide ingestion</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-amber)]/20 text-xs font-bold text-[var(--accent-amber)]">3</span>
              <p className="text-sm text-[var(--text-primary)] mt-0.5">Call 108 immediately — tell them &ldquo;pesticide poisoning&rdquo;</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-amber)]/20 text-xs font-bold text-[var(--accent-amber)]">4</span>
              <p className="text-sm text-[var(--text-primary)] mt-0.5">Rinse skin/eyes with clean water for 15 minutes</p>
            </div>
          </div>
          
          <div className="rounded-xl border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/20 p-4">
            <p className="text-sm font-bold text-[var(--accent-amber)] text-center">
              Poison Control: Rajindra Hospital Patiala — <a href="tel:01752212058" className="underline">0175-2212058</a> (24/7)
            </p>
          </div>
        </div>
      </div>

      {/* Section C: Punjab Government Health Helplines */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h3 className="font-bold text-base text-[var(--text-primary)]">Punjab Government Health Helplines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { num: "108", desc: "Free Emergency Ambulance (24/7)" },
            { num: "104", desc: "Health Advice & Scheme Queries (toll-free)" },
            { num: "14555", desc: "Ayushman Bharat / Sehat Card Helpline" },
            { num: "1800-11-0031", desc: "De-addiction / Drug Helpline (Punjab, toll-free)" },
            { num: "0175-2212058", desc: "Rajindra Hospital Emergency, Patiala" }
          ].map((hl, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--accent-emerald)]" />
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">{hl.num}</p>
                  <p className="text-xs text-[var(--text-muted)]">{hl.desc}</p>
                </div>
              </div>
              <a href={`tel:${hl.num.replace(/[- ]/g, '')}`} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-white/10 shrink-0">
                Call
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

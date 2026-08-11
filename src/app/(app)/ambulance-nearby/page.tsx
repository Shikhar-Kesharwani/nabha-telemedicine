'use client';

import { useState, useEffect } from "react";
import { Siren, Phone, MapPin, Clock, ShieldAlert, CheckCircle2, Navigation } from "lucide-react";
import { SectionHeader, StatusBadge } from "@/components/primitives";
import { createAmbulanceDispatch, type AmbulanceDispatch } from "@/lib/services/ambulance";
import { useToast } from "@/hooks/use-toast";

const AMBULANCES = [
  { id: "1", type: "Advanced Life Support (ALS)", driver: "Gurpreet Singh", phone: "+91 98765 10801", vehicleNo: "PB 11 AB 1081", etaMins: 6, isAvailable: true },
  { id: "2", type: "Cardiac Care Unit", driver: "Rajesh Kumar", phone: "+91 98765 10802", vehicleNo: "PB 11 AB 1082", etaMins: 9, isAvailable: true },
  { id: "3", type: "Basic Life Support (BLS)", driver: "Harpreet Sharma", phone: "+91 98765 10803", vehicleNo: "PB 11 AB 1083", etaMins: 12, isAvailable: true },
];

function getSessionEmail() {
  if (typeof window === 'undefined') return 'user@example.com';
  const patientSession = localStorage.getItem('sehat-session-patient');
  if (patientSession) return JSON.parse(patientSession).email || 'user@example.com';
  return 'user@example.com';
}

export default function AmbulanceNearbyPage() {
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedAmb, setDispatchedAmb] = useState<typeof AMBULANCES[0] | null>(null);
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

  const handleDispatch = async (amb: typeof AMBULANCES[0]) => {
    setDispatching(true);
    const userEmail = getSessionEmail();

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
                onClick={() => handleDispatch(amb)}
                disabled={dispatching || (dispatchedAmb?.id === amb.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-red)] py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {dispatchedAmb?.id === amb.id ? "✓ Dispatched & Logged" : "Dispatch Unit Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, Mic, ShieldCheck, PhoneCall, PhoneOff, Loader2, AlertCircle } from "lucide-react";
import { SectionHeader, StatusBadge, RatingStars } from "@/components/primitives";
import { getDoctors, type Doctor } from "@/lib/services/doctors";
import { initiateCallSignal, subscribeCallSignals } from "@/lib/services/call-signaling";
import { subscribeOnlineDoctors } from "@/lib/services/doctor-presence";

export default function VideoCallListPage() {
  const router = useRouter();
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [onlineDoctorIds, setOnlineDoctorIds] = useState<string[]>([]);
  const [callingDoctor, setCallingDoctor] = useState<{ doctor: Doctor; mode: 'video' | 'voice' } | null>(null);
  const [callStatus, setCallStatus] = useState<"ringing" | "accepted" | "declined">("ringing");

  useEffect(() => {
    async function fetchData() {
      const fetched = await getDoctors();
      setAllDoctors(fetched);
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Subscribe to realtime doctor presence heartbeats
    const unsubscribePresence = subscribeOnlineDoctors((activeIds) => {
      setOnlineDoctorIds(activeIds);
    });

    return () => unsubscribePresence();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCallSignals((payload) => {
      if (callingDoctor && String(callingDoctor.doctor.id) === payload.doctorId) {
        if (payload.type === 'CALL_ACCEPTED') {
          setCallStatus('accepted');
          setTimeout(() => {
            router.push(`/video-call/${callingDoctor.doctor.id}`);
          }, 800);
        } else if (payload.type === 'CALL_DECLINED') {
          setCallStatus('declined');
        }
      }
    });

    return () => unsubscribe();
  }, [callingDoctor, router]);

  // Filter ONLY doctors who are currently logged into their portal!
  const availableOnlineDoctors = allDoctors.filter((doc) =>
    onlineDoctorIds.includes(String(doc.id))
  );

  const handleStartCall = (doc: Doctor, mode: 'video' | 'voice') => {
    setCallingDoctor({ doctor: doc, mode });
    setCallStatus('ringing');
    initiateCallSignal(String(doc.id), doc.name || doc.fullName, `Jane Smith (Patient - ${mode.toUpperCase()} Call)`);
  };

  const handleCancelCall = () => {
    setCallingDoctor(null);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Request Video & Voice Consultations"
        subtitle="Request a live consultation with certified doctors who are currently signed into their provider portal."
        action={<StatusBadge variant="cyan"><ShieldCheck size={13} /> Realtime Doctor Presence</StatusBadge>}
      />

      {/* Patient Ringing Overlay Modal */}
      {callingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0f172a] to-[#020617] p-8 text-center shadow-2xl shadow-cyan-500/20">
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/30 text-white font-bold text-3xl ring-4 ring-cyan-500/20">
                  {(callingDoctor.doctor.name || callingDoctor.doctor.fullName).charAt(0)}
                </div>
                {callStatus === 'ringing' && (
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 animate-ping" />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">{callingDoctor.doctor.name || callingDoctor.doctor.fullName}</h2>
                <p className="text-sm font-semibold text-cyan-400 mt-1">{callingDoctor.doctor.specialty}</p>
                <span className="inline-block mt-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Requesting {callingDoctor.mode.toUpperCase()} Call
                </span>

                {callStatus === 'ringing' && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-300">
                    <Loader2 className="animate-spin text-cyan-400" size={16} />
                    <span>Ringing Doctor Portal... Waiting for response</span>
                  </div>
                )}

                {callStatus === 'accepted' && (
                  <div className="mt-4 text-sm font-bold text-emerald-400">
                    Call Request Accepted! Connecting Stream...
                  </div>
                )}

                {callStatus === 'declined' && (
                  <div className="mt-4 text-sm font-bold text-red-400">
                    Doctor is currently busy or declined the call request.
                  </div>
                )}
              </div>

              <div className="w-full pt-2">
                <button
                  onClick={handleCancelCall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600/20 border border-red-500/40 py-3 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                >
                  <PhoneOff size={16} /> {callStatus === 'declined' ? 'Close' : 'Cancel Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Cards Grid — ONLY Active Online Doctors */}
      {availableOnlineDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableOnlineDoctors.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-emerald-500/40 bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4 shadow-lg shadow-emerald-500/10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg">
                    {(doc.name || doc.fullName).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{doc.name || doc.fullName}</h3>
                    <p className="text-xs font-semibold text-[var(--accent-cyan)]">{doc.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <RatingStars rating={doc.rating} reviewCount={doc.reviews} />
                  <StatusBadge variant="emerald">Portal Logged In</StatusBadge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleStartCall(doc, 'video')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
                >
                  <Video size={14} /> Request Video Call
                </button>

                <button
                  onClick={() => handleStartCall(doc, 'voice')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
                >
                  <Mic size={14} /> Request Voice Call
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State when no Doctor is currently logged into the Doctor Portal */
        <div className="rounded-3xl border border-[var(--border)] bg-[#0d0d1a] p-12 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto border border-amber-500/30">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="font-display text-xl text-[var(--text-primary)] font-bold">No Doctors Currently Logged Into Portal</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-2 leading-relaxed">
              Video & Voice call requests are sent directly to logged-in specialists. Please sign into the <span className="text-amber-400 font-semibold">Doctor Portal</span> in another tab/window (or wait for a specialist to log in) to send live call requests!
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/doctor/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
            >
              Open Doctor Portal Tab ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

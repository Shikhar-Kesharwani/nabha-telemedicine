'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video, ShieldCheck, User } from "lucide-react";
import { subscribeCallSignals, respondCallSignal, type CallSignalPayload } from "@/lib/services/call-signaling";

export function DoctorCallModal() {
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<CallSignalPayload | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCallSignals((payload) => {
      if (payload.type === 'CALL_INITIATED') {
        setIncomingCall(payload);
        // Play synthetic ringing sound via Web Audio API
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          setTimeout(() => {
            osc.stop();
            ctx.close();
          }, 1500);
        } catch (e) {
          console.warn("Audio Context sound error:", e);
        }
      } else if (payload.type === 'CALL_DECLINED' || payload.type === 'CALL_ENDED') {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!incomingCall) return null;

  const handleAccept = () => {
    respondCallSignal('CALL_ACCEPTED', incomingCall.doctorId, incomingCall.doctorName, incomingCall.patientName);
    setIncomingCall(null);
    router.push(`/video-call/${incomingCall.doctorId}`);
  };

  const handleDecline = () => {
    respondCallSignal('CALL_DECLINED', incomingCall.doctorId, incomingCall.doctorName, incomingCall.patientName);
    setIncomingCall(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0f172a] to-[#020617] p-8 text-center shadow-2xl shadow-cyan-500/20 overflow-hidden">
        {/* Radar Ringing Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="h-64 w-64 rounded-full border border-cyan-500 animate-ping" />
          <div className="h-48 w-48 rounded-full border border-indigo-500 animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/30 text-white font-bold text-3xl ring-4 ring-cyan-500/20 animate-bounce">
            <User size={48} />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
              <Video size={13} /> INCOMING VIDEO CONSULTATION
            </div>
            <h2 className="text-2xl font-black text-white">{incomingCall.patientName || "Patient"}</h2>
            <p className="text-sm font-medium text-slate-400 mt-1">is requesting a live 720p HD video call...</p>
          </div>

          <div className="flex items-center justify-center gap-6 w-full pt-4">
            <button
              onClick={handleDecline}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-600/20 border border-red-500/40 py-3.5 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/20"
            >
              <PhoneOff size={18} /> Decline
            </button>

            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 hover:opacity-95 transition-all animate-pulse"
            >
              <Phone size={18} /> Accept Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, MicOff, PhoneOff, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { AvatarWithRing, PulseRadar, StatusBadge } from "@/components/primitives";
import { getDoctorById, type Doctor } from "@/lib/services/doctors";
import { useToast } from "@/hooks/use-toast";

export default function VoiceCallRoomPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    async function fetchDoctor() {
      if (doctorId) {
        const doc = await getDoctorById(doctorId);
        setDoctor(doc);
      }
    }
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function getMicPermission() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (error) {
        setHasMicPermission(false);
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Enable microphone permissions in browser settings.",
        });
      }
    }

    getMicPermission();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [toast]);

  const toggleMic = () => setIsMicOn(!isMicOn);

  const handleEndCall = () => {
    toast({ title: "Call Ended", description: `Call with ${doctor?.name || "doctor"} ended.` });
    router.push("/dashboard");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!doctor) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-violet)]" />
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-8rem)] flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl overflow-hidden">
      <Link href="/voice-call" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        <ArrowLeft size={16} /> Back to Doctor Selection
      </Link>

      <div className="ambient-glow" style={{ width: 450, height: 450, top: "20%", left: "50%", transform: "translateX(-50%)" }} />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md w-full">
        <div>
          <StatusBadge variant="violet">Encrypted Audio</StatusBadge>
          <h2 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)] mt-2">{doctor.name}</h2>
          <p className="text-xs font-semibold text-[var(--accent-violet)] mt-1">{doctor.specialty}</p>
        </div>

        {/* Pulsing Audio Frequency Animation */}
        <div className="relative flex items-center justify-center py-4">
          <PulseRadar color="var(--accent-violet)" size={200} />
          <div className="absolute inset-0 flex items-center justify-center">
            <AvatarWithRing name={doctor.name || doctor.fullName} size={90} orbital={true} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--accent-emerald)]">
          <span className="glow-dot-green" /> {formatDuration(callDuration)} · Connected
        </div>

        {hasMicPermission === false && (
          <div className="rounded-xl border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 p-3 text-xs text-[var(--accent-red)] flex items-start gap-2 text-left w-full">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>Microphone access required. Please allow microphone permissions in your browser.</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={toggleMic}
            disabled={!hasMicPermission}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
              isMicOn ? "bg-white/10 text-[var(--text-primary)]" : "bg-[var(--accent-red)] text-white"
            } disabled:opacity-40`}
          >
            {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={handleEndCall}
            className="flex h-14 w-16 items-center justify-center rounded-full bg-[var(--accent-red)] text-white shadow-xl shadow-red-600/40 hover:opacity-90"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

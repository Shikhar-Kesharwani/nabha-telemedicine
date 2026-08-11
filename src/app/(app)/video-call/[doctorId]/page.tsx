'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { StatusBadge, AvatarWithRing } from "@/components/primitives";
import { getDoctorById, type Doctor } from "@/lib/services/doctors";

export default function VideoCallRoomPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connected, setConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

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
    // WebRTC Free STUN Configuration (Google Free STUN Server)
    const pcConfig: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(pcConfig);
    peerRef.current = pc;

    // Free local BroadcastChannel for tab-to-tab Signaling
    const channelName = `sehat-webrtc-room-${doctorId}`;
    const signalingChannel = new BroadcastChannel(channelName);

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnected(true);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Fix: Serialize candidate object to plain JSON so BroadcastChannel clone error is prevented
        const candidateJson = event.candidate.toJSON ? event.candidate.toJSON() : {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        };
        signalingChannel.postMessage({ type: "candidate", candidate: candidateJson });
      }
    };

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Signal readiness
        signalingChannel.postMessage({ type: "ready" });
      } catch (err) {
        console.warn("Camera/Mic access error:", err);
      }
    }

    initMedia();

    signalingChannel.onmessage = async (e) => {
      const msg = e.data;
      if (!msg) return;

      if (msg.type === "ready") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const offerJson = { sdp: offer.sdp, type: offer.type };
        signalingChannel.postMessage({ type: "offer", offer: offerJson });
      } else if (msg.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const answerJson = { sdp: answer.sdp, type: answer.type };
        signalingChannel.postMessage({ type: "answer", answer: answerJson });
      } else if (msg.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
      } else if (msg.type === "candidate") {
        try {
          if (msg.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          }
        } catch (err) {
          console.error("ICE candidate error:", err);
        }
      }
    };

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      pc.close();
      signalingChannel.close();
    };
  }, [doctorId]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !isMicOn;
    });
    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !isVideoOn;
    });
    setIsVideoOn(!isVideoOn);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!doctor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-cyan)]" size={32} />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full rounded-3xl overflow-hidden bg-black border border-[var(--border)] shadow-2xl">
      {/* Remote Stream Video Element */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${connected ? 'block' : 'hidden'}`}
      />

      {/* Fallback Screen when second peer not joined yet */}
      {!connected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black via-[#0d0d1a] to-black">
          <div className="ambient-glow" style={{ width: 500, height: 500, top: -100, right: -100 }} />

          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <AvatarWithRing name={doctor.name || doctor.fullName} size={120} orbital={true} />
            <div>
              <h2 className="font-display text-2xl text-[var(--text-primary)]">{doctor.name || doctor.fullName}</h2>
              <p className="text-sm font-semibold text-[var(--accent-cyan)] mt-1">{doctor.specialty}</p>
            </div>

            <StatusBadge variant="cyan">
              <ShieldCheck size={13} /> STUN WebRTC P2P Room Ready
            </StatusBadge>

            <p className="text-xs text-[var(--text-muted)] max-w-sm">
              Camera & Microphone initialized. Waiting for remote peer stream...
            </p>
          </div>
        </div>
      )}

      {/* Local Camera PIP Floating Box */}
      <div className="absolute top-6 right-6 z-20 w-44 h-32 rounded-2xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isVideoOn ? 'block' : 'hidden'}`}
        />
        {!isVideoOn && (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xs font-bold text-slate-400">
            Camera Off
          </div>
        )}
      </div>

      {/* Top Floating Overlay Info */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 rounded-full bg-black/60 backdrop-blur border border-white/10 px-4 py-2 text-xs">
        <span className="glow-dot-green" />
        <span className="font-mono font-bold text-white">{formatDuration(callDuration)}</span>
        <span className="text-slate-400">|</span>
        <span className="text-[var(--accent-cyan)] font-semibold">{doctor.name || doctor.fullName}</span>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 rounded-full bg-black/70 backdrop-blur border border-white/15 px-6 py-3 shadow-2xl">
        <button
          onClick={toggleMic}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            isMicOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/40'
          }`}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            isVideoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/40'
          }`}
        >
          {isVideoOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
        </button>

        <Link
          href={`/doctor-chat/${doctor.id}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <MessageSquare size={20} />
        </Link>

        <button
          onClick={() => router.push("/video-call")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/50 hover:bg-red-700 transition-all"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}

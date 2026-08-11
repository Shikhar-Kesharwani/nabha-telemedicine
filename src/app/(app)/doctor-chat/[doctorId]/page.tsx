'use client';

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Paperclip,
  Mic,
  Video,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  Image as ImageIcon,
} from "lucide-react";
import { StatusBadge, AvatarWithRing } from "@/components/primitives";
import { getDoctorById, type Doctor } from "@/lib/services/doctors";
import { getChatMessages, sendChatMessage, type ChatMessage } from "@/lib/services/chat";
import { isCallAllowedForPatient, subscribeCallPermissions } from "@/lib/services/call-permissions";
import { initiateCallSignal, subscribeCallSignals } from "@/lib/services/call-signaling";
import { useRouter } from "next/navigation";

export default function DoctorChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null);
  const [isCallAllowed, setIsCallAllowed] = useState(false);
  const [callingMode, setCallingMode] = useState<'video' | 'voice' | null>(null);
  const [callStatus, setCallStatus] = useState<"ringing" | "accepted" | "declined">("ringing");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userEmail = "user@example.com";
  const userAvatar = "https://picsum.photos/seed/user-avatar/200/200";

  useEffect(() => {
    async function initData() {
      if (doctorId) {
        const doc = await getDoctorById(doctorId);
        setDoctor(doc);

        const history = await getChatMessages(userEmail, doctorId);
        setMessages(history);
      }
    }
    initData();
  }, [doctorId]);

  // Subscribe to Call Permission status granted by Doctor
  useEffect(() => {
    const unsubscribe = subscribeCallPermissions(() => {
      if (doctorId) {
        setIsCallAllowed(isCallAllowedForPatient(doctorId, "1"));
      }
    });

    return () => unsubscribe();
  }, [doctorId]);

  // Subscribe to call signal responses from Doctor
  useEffect(() => {
    const unsubscribe = subscribeCallSignals((payload) => {
      if (callingMode && payload.doctorId === doctorId) {
        if (payload.type === 'CALL_ACCEPTED') {
          setCallStatus('accepted');
          setTimeout(() => {
            router.push(`/video-call/${doctorId}`);
          }, 800);
        } else if (payload.type === 'CALL_DECLINED') {
          setCallStatus('declined');
        }
      }
    });

    return () => unsubscribe();
  }, [callingMode, doctorId, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;

    const currentInput = input;
    const currentAttachment = attachment;

    setInput("");
    setAttachment(null);

    const updatedMessages = await sendChatMessage(
      userEmail,
      doctorId,
      currentInput,
      'user',
      userAvatar,
      currentAttachment?.name,
      currentAttachment?.url
    );

    setMessages(updatedMessages);

    // Simulate Doctor automated review response
    setTimeout(async () => {
      const doctorReply = `Thank you for sharing your symptoms and details. I am reviewing your message and attachments. Once verified, I will grant Video/Voice Call permission for our consultation.`;
      const replyHistory = await sendChatMessage(
        userEmail,
        doctorId,
        doctorReply,
        'doctor',
        doctor?.avatar || "D"
      );
      setMessages(replyHistory);
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleRequestCall = (mode: 'video' | 'voice') => {
    if (!isCallAllowed) return;
    setCallingMode(mode);
    setCallStatus('ringing');
    initiateCallSignal(doctorId, doctor?.name || doctor?.fullName || "Doctor", "Jane Smith (Patient)");
  };

  if (!doctor) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-violet)]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/doctor-chat" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={18} />
          </Link>

          <AvatarWithRing name={doctor.name || doctor.fullName} online={true} size={42} />

          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">{doctor.name || doctor.fullName}</h3>
            <p className="text-xs text-[var(--accent-violet)] font-semibold">{doctor.specialty}</p>
          </div>
        </div>

        {/* Call Request Action Buttons (Locked until Doctor Permission Granted) */}
        <div className="flex items-center gap-3">
          <StatusBadge variant="violet"><ShieldCheck size={13} /> Encrypted</StatusBadge>

          {isCallAllowed ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
              <button
                onClick={() => handleRequestCall('voice')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all"
              >
                <Mic size={14} /> Request Voice Call
              </button>

              <button
                onClick={() => handleRequestCall('video')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
              >
                <Video size={14} /> Request Video Call
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-400">
              <Lock size={13} className="text-amber-400" /> Explain in Chat First to Unlock Call
            </div>
          )}
        </div>
      </div>

      {/* Pre-Consultation Guidance Banner */}
      {!isCallAllowed && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-amber-400" />
            <span>
              <strong>Pre-Consultation Phase:</strong> Please describe your health problem and attach any prescriptions or medical files below. Once the doctor reviews your chat, they will unlock Video & Voice Call access for you.
            </span>
          </div>
        </div>
      )}

      {isCallAllowed && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-emerald-500/20 px-6 py-2 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in duration-300">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span><strong>Doctor Approved!</strong> Call permission granted by {doctor.name || doctor.fullName}. You can now request Video or Voice Call above.</span>
        </div>
      )}

      {/* Calling Ringing Overlay */}
      {callingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0f172a] to-[#020617] p-8 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Requesting {callingMode.toUpperCase()} Call</h3>
            <p className="text-xs text-slate-300 mb-6">Ringing {doctor.name || doctor.fullName}&apos;s Doctor Portal...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-cyan-400 mb-6">
              <Loader2 className="animate-spin" size={18} />
              <span>{callStatus === 'ringing' ? 'Waiting for doctor to accept...' : callStatus === 'accepted' ? 'Call Accepted! Connecting...' : 'Call Declined'}</span>
            </div>
            <button
              onClick={() => setCallingMode(null)}
              className="w-full py-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md rounded-2xl p-4 space-y-1.5 ${
                isUser
                  ? 'bg-[var(--accent-indigo)] text-white rounded-br-none'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {msg.attachment?.name && (
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/20 p-2 text-xs font-mono border border-white/10">
                    <FileText size={14} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{msg.attachment.name}</span>
                  </div>
                )}

                <div className={`text-[10px] ${isUser ? 'text-indigo-200' : 'text-[var(--text-muted)]'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">
        {attachment && (
          <div className="flex items-center justify-between rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 text-xs text-indigo-300">
            <span className="truncate">Attached: {attachment.name}</span>
            <button type="button" onClick={() => setAttachment(null)} className="text-red-400 font-bold hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Attach Prescription or Medical Document"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Explain your problem, symptoms, or ask the doctor..."
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-indigo)] transition-all"
          />

          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-indigo)] text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

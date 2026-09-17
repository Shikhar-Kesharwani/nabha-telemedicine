'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Languages,
} from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  actionLink?: { label: string; url: string };
  timestamp: string;
}

const FAQ_CHIPS = [
  'ਸਿਵਲ ਹਸਪਤਾਲ ਨਾਭਾ ਓਪੀਡੀ ਸਮਾਂ? (OPD Times)',
  'Jan Aushadhi store location in Nabha?',
  'Pesticide poisoning emergency help?',
  'Am I eligible for Ayushman Sehat Card?',
  'Urgent O+ or B+ blood in Nabha?',
];

export function SehatSahayakChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ (Sat Sri Akal! I am Sehat Sahayak AI). I can assist you in Punjabi, Hindi, or English regarding doctors, medicines, schemes, and emergencies in Nabha.',
      timestamp: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pa-IN'; // Punjabi
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
  };

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate Contextual Nabha Medical Response
    setTimeout(() => {
      const lower = q.toLowerCase();
      let botText = '';
      let actionLink: { label: string; url: string } | undefined;

      if (lower.includes('opd') || lower.includes('ਸਮਾਂ') || lower.includes('civil hospital') || lower.includes('timing')) {
        botText = 'Civil Hospital Nabha OPD functions Monday to Saturday from 8:00 AM to 2:00 PM. Registration counter closes at 1:00 PM. Emergency services and Labor Room are open 24/7.';
        actionLink = { label: 'View Full 10-Department Schedule', url: '/civil-hospital-opd' };
      } else if (lower.includes('jan aushadhi') || lower.includes('medicine') || lower.includes('generic') || lower.includes('ਦਵਾਈ')) {
        botText = 'Nabha has 2 certified Jan Aushadhi Kendras: 1) Main Market Road, near Civil Hospital Gate (Ph: +91 98145 12345), and 2) Model Town Market. Generic medicines save up to 85% compared to private chemist shops.';
        actionLink = { label: 'Scan Your Prescription for Generic Match', url: '/prescription-scanner' };
      } else if (lower.includes('pesticide') || lower.includes('spray') || lower.includes('poison') || lower.includes('ਕੀਟਨਾਸ਼ਕ')) {
        botText = 'CRITICAL: For pesticide poisoning, DO NOT induce vomiting. Wash skin/eyes with clean water for 15 mins. Call 108 immediately. Antidote Atropine is stocked 24/7 at Civil Hospital Nabha and Rajindra Hospital Patiala.';
        actionLink = { label: 'Dispatch Emergency Ambulance (108)', url: '/ambulance-nearby' };
      } else if (lower.includes('scheme') || lower.includes('ayushman') || lower.includes('sehat card') || lower.includes('ਕਾਰਡ')) {
        botText = 'Punjab residents with Blue/Yellow ration cards or J-Forms are entitled to ₹5,00,000 cashless hospitalization under Mukh Mantri Sehat Bima Yojana (MMSBY). Enrolment is done at Sewa Kendra Nabha.';
        actionLink = { label: 'Calculate Your Exact Scheme Eligibility', url: '/scheme-checker' };
      } else if (lower.includes('blood') || lower.includes('ਖੂਨ') || lower.includes('donor')) {
        botText = 'You can browse active blood requests or contact Civil Hospital Nabha Blood Storage Centre (01765-222250). Compatible volunteer donors can be contacted directly in our emergency registry.';
        actionLink = { label: 'Open Emergency Blood Network', url: '/blood-request' };
      } else if (lower.includes('fever') || lower.includes('bukhar') || lower.includes('ਬੁਖਾਰ') || lower.includes('dengue')) {
        botText = 'For high fever with joint or eye pain, rule out Dengue with a rapid CBC platelet test at Krsnaa Diagnostics or Civil Hospital Nabha. Take only Paracetamol (avoid Ibuprofen/Aspirin) and drink ORS fluids.';
        actionLink = { label: 'Run AI Differential Symptom Triage', url: '/symptom-checker' };
      } else {
        botText = `I understand your query: "${q}". You can consult one of our verified specialists directly via encrypted video or chat, or book a Civil Hospital consultation.`;
        actionLink = { label: 'Book Specialist Consultation', url: '/appointments' };
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botText,
        actionLink,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  return (
    <div className="fixed bottom-6 left-5 z-[9998] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[340px] sm:w-[380px] h-[520px] rounded-2xl flex flex-col overflow-hidden shadow-2xl mb-3 border"
            style={{
              background: 'rgba(10,10,24,0.98)',
              borderColor: 'rgba(34,211,238,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(34,211,238,0.15)',
            }}
          >
            {/* Chat Header */}
            <div
              className="p-3.5 px-4 flex items-center justify-between border-b"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(99,102,241,0.15) 100%)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    ਸਿਹਤ ਸਹਾਇਕ · Sehat Sahayak <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-[10px] text-cyan-300">Nabha Community Health AI Assistant</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Quick Topic Chips */}
            <div className="p-2 border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar flex gap-1.5">
              {FAQ_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                      <Bot size={13} />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2 ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>

                    {m.actionLink && (
                      <div className="pt-1.5 border-t border-white/10">
                        <Link
                          href={m.actionLink.url}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md transition-all"
                        >
                          {m.actionLink.label} <ChevronRight size={12} />
                        </Link>
                      </div>
                    )}

                    <span className="block text-[9px] text-slate-400 text-right">{m.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-2.5 border-t border-white/5 bg-black/60 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                title="Speak in Punjabi / Hindi"
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                  listening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                {listening ? <Mic size={15} /> : <MicOff size={15} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="ਪੰਜਾਬੀ, हिन्दी or English..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="h-8 w-8 rounded-lg flex items-center justify-center bg-cyan-500 text-black font-bold disabled:opacity-30 transition-all hover:bg-cyan-400"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black tracking-wide uppercase transition-all shadow-xl border border-cyan-400/40 text-cyan-300"
        style={{
          background: isOpen ? 'rgba(34,211,238,0.2)' : 'rgba(10,10,25,0.95)',
          boxShadow: '0 4px 24px rgba(34,211,238,0.3)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Sparkles size={14} className="text-cyan-400" />
        {isOpen ? 'ਬੰਦ ਕਰੋ (Close)' : 'ਸਿਹਤ ਸਹਾਇਕ AI'}
      </motion.button>
    </div>
  );
}

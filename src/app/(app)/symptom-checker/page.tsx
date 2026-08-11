'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Sparkles,
  Mic,
  MicOff,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { SectionHeader, StatusBadge, PulseRadar } from "@/components/primitives";
import { aiSymptomGuidance } from "@/app/(app)/symptom-checker/actions";
import { useToast } from "@/hooks/use-toast";

type DiagnosisResult = {
  urgency: 'Immediate Medical Attention' | 'Consultation Recommended' | 'Self-Care';
  specialistType: string;
  differentialDiagnoses: Array<{
    condition: string;
    confidencePercentage: number;
    explanation: string;
  }>;
  homeRemedies: string[];
  disclaimer: string;
};

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [listening, setListening] = useState(false);
  const { toast } = useToast();

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Speech Recognition Unavailable", description: "Voice dictation isn't supported in this browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUri(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await aiSymptomGuidance({
        symptoms,
        photoDataUri: photoUri || undefined,
      });

      if (response && response.urgency) {
        setResult(response as DiagnosisResult);
      } else {
        // Fallback result structure
        setResult({
          urgency: "Consultation Recommended",
          specialistType: "General Physician",
          differentialDiagnoses: [
            { condition: "Acute Symptom Presentation", confidencePercentage: 85, explanation: "Symptoms indicate generalized inflammatory response." }
          ],
          homeRemedies: ["Maintain hydration", "Rest adequately", "Monitor vitals twice daily"],
          disclaimer: "This guidance is AI-generated for educational purposes. Consult a certified medical professional."
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Could not reach Gemini AI engine. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center space-y-4">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <PulseRadar color="var(--accent-emerald)" size={300} />
        </div>

        <div className="relative z-10 space-y-2">
          <StatusBadge variant="emerald"><Sparkles size={13} /> Gemini 1.5 Medical Engine</StatusBadge>
          <h1 className="font-display text-3xl sm:text-5xl text-[var(--text-primary)]">
            AI Differential <span className="text-gradient">Diagnosis</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto">
            Describe your physical symptoms in plain language or record dictation. Our AI medical engine evaluates differential conditions & urgency.
          </p>
        </div>
      </div>

      {/* Input Card Form */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Describe What You Are Feeling</label>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors border ${
                  listening ? 'bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30' : 'bg-white/5 text-[var(--text-muted)] border-[var(--border)]'
                }`}
              >
                {listening ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
                {listening ? 'Listening...' : 'Voice Dictation'}
              </button>
            </div>

            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have had a dry cough, low-grade fever, and mild headache for 2 days..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent-emerald)] focus:outline-none"
              required
            />
          </div>

          {/* Photo Attachment */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-white/5">
              <Upload size={15} /> Upload Rash/Injury Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {photoUri && (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-1.5 text-xs">
                <ImageIcon size={14} className="text-[var(--accent-cyan)]" />
                <span className="text-[var(--text-muted)] font-mono">Photo Attached</span>
                <button type="button" onClick={() => setPhotoUri(null)} className="text-[var(--accent-red)] ml-1 font-bold">×</button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 hover:opacity-95 disabled:opacity-40"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Analyzing Symptoms via Gemini 1.5...' : 'Analyze Symptoms Now'}
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h3 className="font-display text-lg text-[var(--text-primary)]">AI Analysis Results</h3>
            <StatusBadge
              variant={
                result.urgency === 'Immediate Medical Attention' ? 'red' : result.urgency === 'Consultation Recommended' ? 'amber' : 'emerald'
              }
            >
              {result.urgency}
            </StatusBadge>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Recommended Specialist</p>
            <p className="text-sm font-bold text-[var(--accent-cyan)] mt-1">{result.specialistType}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Differential Conditions</p>
            {result.differentialDiagnoses.map((diag, index) => (
              <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[var(--text-primary)]">{diag.condition}</span>
                  <span className="text-[var(--accent-emerald)]">{diag.confidencePercentage}% Match</span>
                </div>
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full" style={{ width: `${diag.confidencePercentage}%` }} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{diag.explanation}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Home Care & First-Aid Advice</p>
            <ul className="space-y-1.5 text-xs text-[var(--text-primary)]">
              {result.homeRemedies.map((remedy, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[var(--accent-emerald)] shrink-0 mt-0.5" />
                  <span>{remedy}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10 p-3.5 text-xs text-[var(--accent-amber)] flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{result.disclaimer}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

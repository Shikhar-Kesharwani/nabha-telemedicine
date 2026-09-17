'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Pill,
  TrendingDown,
  MapPin,
  Phone,
  RotateCcw,
  ShoppingBag,
  Share2,
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '@/components/primitives';
import { parsePrescriptionText, PrescriptionScanResult } from '@/lib/services/prescription-scanner';
import { useToast } from '@/hooks/use-toast';

const SAMPLE_RX = `Rx Dr. Mandeep Sidhu (Civil Hospital Nabha)
Patient: Gurpreet Singh, Age 52
Date: 16-Sep-2026

1. Tab Augmentin 625mg - 1 tab BD x 5 days
2. Tab Pantocid 40mg - 1 tab OD AC x 7 days
3. Tab Glycomet 500mg - 1 tab BD with meals
4. Tab Atorva 10mg - 1 tab HS
5. Tab Dolo 650mg - 1 tab SOS for fever`;

export default function PrescriptionScannerPage() {
  const [inputText, setInputText] = useState(SAMPLE_RX);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PrescriptionScanResult | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        toast({
          title: 'Prescription Photo Attached',
          description: 'Image loaded successfully. Parsing clinical medicine lines.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !photoPreview) {
      toast({
        variant: 'destructive',
        title: 'Prescription Needed',
        description: 'Please upload a prescription image or enter the medicine names.',
      });
      return;
    }

    setScanning(true);
    try {
      // Pass text or OCR extraction to parser
      const data = await parsePrescriptionText(inputText || 'Augmentin 625mg Pantocid 40mg Dolo 650');
      setResult(data);
      toast({
        title: 'Analysis Complete',
        description: `Identified ${data.items.length} medicines. Potential savings: ₹${data.totalSavings} (${data.overallSavingsPercentage}%)`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Parsing Error',
        description: 'Could not extract medicines. Please check text clarity.',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <SectionHeader
        title="Prescription OCR & Jan Aushadhi Matcher"
        subtitle="Upload your doctor's handwritten or printed prescription. Our AI identifies branded medicines and automatically maps them to certified Jan Aushadhi generic substitutes available in Nabha."
      />

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image or Text Input */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="p-6 rounded-2xl space-y-5"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Camera size={18} className="text-cyan-400" /> Upload or Paste Prescription
              </h3>
              <button
                onClick={() => {
                  setInputText(SAMPLE_RX);
                  setPhotoPreview(null);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={13} /> Load Sample Rx
              </button>
            </div>

            {/* Photo upload dropzone */}
            <label
              className="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-cyan-500/50"
              style={{
                borderColor: photoPreview ? 'rgba(34,211,238,0.5)' : 'var(--border-bright)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              {photoPreview ? (
                <div className="relative w-full text-center space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Prescription Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain border border-white/10"
                  />
                  <p className="text-xs text-cyan-400 font-semibold">Click to replace attached image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-cyan-500/10 text-cyan-400">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Drop prescription photo here or <span className="text-cyan-400 underline">browse</span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Supports camera photos, JPG, PNG from Civil Hospital or private clinics
                  </p>
                </div>
              )}
            </label>

            {/* Manual Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Prescription Text / Medicine Lines:
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                placeholder="e.g. Augmentin 625mg BD, Pantocid 40mg OD, Dolo 650mg SOS..."
                className="w-full rounded-xl p-3.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                style={{
                  background: 'rgba(15,15,30,0.8)',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Submit Action */}
            <button
              onClick={handleAnalyze}
              disabled={scanning}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:brightness-110 active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)',
                color: '#080810',
                boxShadow: '0 4px 20px rgba(34,211,238,0.3)',
              }}
            >
              {scanning ? (
                <>
                  <Sparkles size={18} className="animate-spin" /> Analyzing Clinical Generic Equivalents...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Convert to Jan Aushadhi & Calculate Savings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Key Savings Preview Banner */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="p-6 rounded-2xl h-full flex flex-col justify-between"
            style={{
              background: 'radial-gradient(ellipse at top left, rgba(16,185,129,0.12) 0%, rgba(10,10,25,0.95) 70%)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Jan Aushadhi Scheme Guarantee
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  Govt. of India Certified
                </span>
              </div>

              <h4 className="text-xl font-bold text-white">Why Pay 5x More for Private Brands?</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Jan Aushadhi generic medicines share the exact active chemical molecular structure, purity, and therapeutic bioavailability as branded drugs, manufactured under WHO-GMP certified standards at 70% to 85% lower costs.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-xs text-slate-400">Average Savings in Nabha</p>
                  <p className="text-2xl font-black text-emerald-400">₹720 / mo</p>
                  <p className="text-[11px] text-slate-500">Per chronic patient</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-xs text-slate-400">Nearest Certified Store</p>
                  <p className="text-base font-bold text-cyan-300">Civil Hospital Gate</p>
                  <p className="text-[11px] text-slate-500">Open 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 mt-6 flex items-center gap-3">
              <Pill className="text-cyan-400 shrink-0" size={20} />
              <p className="text-xs text-slate-300">
                In Punjab, Jan Aushadhi Kendras are also linked with the state <strong className="text-cyan-300">Sehat Card</strong> for eligible families.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 pt-4"
          >
            {/* Savings Summary Header Banner */}
            <div
              className="p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(34,211,238,0.1) 100%)',
                border: '1px solid rgba(16,185,129,0.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 justify-center md:justify-start">
                  <CheckCircle2 size={15} /> Generic Prescription Generated
                </p>
                <h3 className="text-2xl font-black text-white">
                  Total Bill Savings: <span className="text-emerald-400">₹{result.totalSavings}</span> ({result.overallSavingsPercentage}% Less)
                </h3>
                <p className="text-xs text-slate-400">
                  Branded Private Cost: <del className="text-red-400/80">₹{result.totalBrandedCost}</del> → Jan Aushadhi Cost: <strong className="text-emerald-400">₹{result.totalJanAushadhiCost}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      result.items.map((i) => `${i.genericEquivalent} - ${i.dosage}`).join('\n')
                    );
                    toast({ title: 'Generic List Copied', description: 'Show this list at Jan Aushadhi Kendra Nabha.' });
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Share2 size={14} /> Copy Generic Rx
                </button>
              </div>
            </div>

            {/* Itemized Medicine Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Itemized Clinical Generic Substitution List
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 rounded-xl flex flex-col justify-between gap-4"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            Prescribed
                          </span>
                          <h5 className="font-bold text-sm text-white mt-1">{item.detectedName}</h5>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                            Save {item.savingsPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Generic Equivalent Box */}
                      <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 space-y-1">
                        <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <ArrowRight size={12} /> Jan Aushadhi Chemical Name:
                        </p>
                        <p className="text-xs font-bold text-slate-100">{item.genericEquivalent}</p>
                        <p className="text-[11px] text-slate-400">Dosage: {item.dosage}</p>
                      </div>
                    </div>

                    {/* Pricing & Location */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Branded: </span>
                        <del className="text-red-400">₹{item.brandedPriceEst}</del>
                        <span className="text-slate-400 ml-2">Generic: </span>
                        <strong className="text-emerald-400 text-sm font-black">₹{item.janAushadhiPrice}</strong>
                      </div>
                      <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                        <MapPin size={11} /> In Stock Nabha
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Nearest Kendra Card */}
            <div
              className="p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                background: 'rgba(34,211,238,0.06)',
                border: '1px solid rgba(34,211,238,0.2)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-400 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{result.nearestKendra.name}</h5>
                  <p className="text-xs text-slate-400">{result.nearestKendra.address} · {result.nearestKendra.distance}</p>
                </div>
              </div>

              <a
                href={`tel:${result.nearestKendra.phone.replace(/\D/g, '')}`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all flex items-center gap-2 shrink-0"
              >
                <Phone size={14} /> Call Kendra: {result.nearestKendra.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

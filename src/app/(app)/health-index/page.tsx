'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wheat,
  Activity,
  AlertTriangle,
  Shield,
  Wind,
  Droplets,
  Calendar,
  CheckCircle2,
  Info,
  HelpCircle,
  BarChart3,
  Hospital,
  Flame,
} from 'lucide-react';
import { SectionHeader } from '@/components/primitives';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

// 12-Month Punjab Regional Epidemiological Cycle
const PUNJAB_DISEASE_CYCLE = [
  { month: 'Jan', respiratory: 75, enteric: 15, vectorBorne: 5, agroChemical: 20 },
  { month: 'Feb', respiratory: 60, enteric: 20, vectorBorne: 5, agroChemical: 35 },
  { month: 'Mar', respiratory: 40, enteric: 25, vectorBorne: 10, agroChemical: 55 },
  { month: 'Apr', respiratory: 30, enteric: 40, vectorBorne: 15, agroChemical: 70 },
  { month: 'May', respiratory: 25, enteric: 65, vectorBorne: 20, agroChemical: 45 },
  { month: 'Jun', respiratory: 20, enteric: 85, vectorBorne: 30, agroChemical: 60 },
  { month: 'Jul', respiratory: 30, enteric: 90, vectorBorne: 60, agroChemical: 85 },
  { month: 'Aug', respiratory: 35, enteric: 80, vectorBorne: 95, agroChemical: 90 },
  { month: 'Sep', respiratory: 45, enteric: 60, vectorBorne: 90, agroChemical: 75 },
  { month: 'Oct', respiratory: 95, enteric: 35, vectorBorne: 70, agroChemical: 40 },
  { month: 'Nov', respiratory: 100, enteric: 25, vectorBorne: 35, agroChemical: 30 },
  { month: 'Dec', respiratory: 85, enteric: 15, vectorBorne: 10, agroChemical: 20 },
];

export default function FarmerHealthIndexPage() {
  // Pesticide Exposure Calculator State
  const [cropType, setCropType] = useState('Paddy / Rice');
  const [sprayMethod, setSprayMethod] = useState('Manual Knapsack Pump');
  const [sprayHoursPerWeek, setSprayHoursPerWeek] = useState(8);
  const [usesMask, setUsesMask] = useState(false);
  const [usesGloves, setUsesGloves] = useState(false);
  const [usesRubberBoots, setUsesRubberBoots] = useState(false);
  const [washesImmediately, setWashesImmediately] = useState(true);

  // Calculate Exposure Score (0 - 100)
  let riskScore = sprayHoursPerWeek * 5;
  if (cropType === 'Cotton / Narma') riskScore += 25; // Heavy organophosphate/synthetic pyrethroid usage
  if (cropType === 'Paddy / Rice') riskScore += 15;
  if (sprayMethod === 'Manual Knapsack Pump') riskScore += 15; // Higher inhalation & skin deposition
  if (!usesMask) riskScore += 20;
  if (!usesGloves) riskScore += 15;
  if (!usesRubberBoots) riskScore += 10;
  if (!washesImmediately) riskScore += 20;
  riskScore = Math.min(100, Math.max(10, riskScore));

  const getRiskCategory = (score: number) => {
    if (score >= 70) return { label: 'CRITICAL HAZARD', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' };
    if (score >= 45) return { label: 'MODERATE RISK', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
    return { label: 'LOW / PROTECTED', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
  };

  const riskStatus = getRiskCategory(riskScore);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <SectionHeader
        title="Punjab Farmer & Community Health Index"
        subtitle="A specialized epidemiological dashboard analyzing occupational health risks in rural Punjab — including agrochemical pesticide toxicity, Malwa groundwater CKDu indicators, and stubble burning respiratory defense."
      />

      {/* Top Section: Pesticide Exposure Risk Calculator */}
      <div
        className="p-6 rounded-2xl space-y-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400">
              <Wheat size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Farmer Agrochemical & Pesticide Safety Calculator</h3>
              <p className="text-xs text-slate-400">Calculate personal toxicity risk from organophosphate & synthetic insecticides.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Calculated Safety Score:</span>
            <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${riskStatus.bg} ${riskStatus.color} ${riskStatus.border}`}>
              {riskStatus.label} ({riskScore}/100)
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Primary Agricultural Crop:</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              style={{ background: 'rgba(15,15,30,0.8)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)' }}
            >
              <option value="Paddy / Rice">Paddy / Rice (Pramukh Fasal)</option>
              <option value="Cotton / Narma">Cotton / Narma (Highest Spray Frequency)</option>
              <option value="Wheat / Kanak">Wheat / Kanak</option>
              <option value="Vegetables / Vegetables">Vegetables / Green Fodder</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Spraying Equipment Used:</label>
            <select
              value={sprayMethod}
              onChange={(e) => setSprayMethod(e.target.value)}
              className="w-full p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              style={{ background: 'rgba(15,15,30,0.8)', border: '1px solid var(--border-bright)', color: 'var(--text-primary)' }}
            >
              <option value="Manual Knapsack Pump">Manual Knapsack Backpack Pump</option>
              <option value="Motorized Battery Pump">Motorized Battery Backpack Pump</option>
              <option value="Tractor Boom Mounted">Tractor Boom Mounted (Enclosed Cabin)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Average Spray Hours / Week: ({sprayHoursPerWeek} hrs)</label>
            <input
              type="range"
              min={1}
              max={25}
              value={sprayHoursPerWeek}
              onChange={(e) => setSprayHoursPerWeek(Number(e.target.value))}
              className="w-full accent-amber-500 mt-2"
            />
          </div>
        </div>

        {/* Safety Measures Checkboxes */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Protective Equipment (PPE):</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={usesMask}
                onChange={(e) => setUsesMask(e.target.checked)}
                className="accent-amber-500"
              />
              Wear N95 / Chemical Mask
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={usesGloves}
                onChange={(e) => setUsesGloves(e.target.checked)}
                className="accent-amber-500"
              />
              Nitrile Chemical Gloves
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={usesRubberBoots}
                onChange={(e) => setUsesRubberBoots(e.target.checked)}
                className="accent-amber-500"
              />
              Rubber Safety Boots
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={washesImmediately}
                onChange={(e) => setWashesImmediately(e.target.checked)}
                className="accent-amber-500"
              />
              Bath & Change Clothes Post-Spray
            </label>
          </div>
        </div>

        {/* Medical Recommendations Output */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
          <Shield className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div className="space-y-1 text-xs">
            <strong className="text-amber-300 block">Clinical Protection Directive for Malwa / Nabha Farmers:</strong>
            <p className="text-slate-300 leading-relaxed">
              Always spray with wind direction (never against wind). If experiencing headache, excessive saliva, or contracted pinpoint pupils, stop immediately and rinse skin with clean water. Antidote <strong className="text-white">Atropine</strong> is stocked 24/7 at <strong className="text-white">Civil Hospital Nabha</strong> and <strong className="text-white">Rajindra Hospital Patiala</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Malwa Belt CKDu & Stubble Smoke Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Malwa Groundwater & Kidney Disease */}
        <div
          className="p-6 rounded-2xl space-y-4"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400">
              <Droplets size={20} />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Malwa Groundwater & Kidney (CKDu) Monitor</h4>
              <p className="text-xs text-slate-400">Southern Punjab groundwater heavy metal & fluoride vigilance</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Due to intensive fertilizer run-off and geological leaching, tap and borewell water in parts of Patiala/Sangrur districts has elevated TDS and nitrates. Annual kidney function screening is essential for early diagnosis of asymptomatic renal disease.
          </p>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <p className="text-xs font-bold text-cyan-400">Free Screening Recommended at Civil Hospital Nabha:</p>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Serum Creatinine & Blood Urea Nitrogen (KFT)</li>
              <li>• Urine Routine / Microalbuminuria (Protein leakage check)</li>
              <li>• Blood Pressure monitoring every 3 months</li>
            </ul>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info size={14} className="text-cyan-400" /> Dialysis is 100% free at Sub-Divisional Hospital Nabha.
          </div>
        </div>

        {/* Stubble Burning & Respiratory Defence */}
        <div
          className="p-6 rounded-2xl space-y-4"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-red-500/20 text-red-400">
              <Flame size={20} />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Stubble Smoke & AQI Respiratory Shield</h4>
              <p className="text-xs text-slate-400">Peak Risk: October 15 to November 30 (Paddy Harvest)</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            During paddy stubble (parali) burning, particulate matter (PM2.5) levels in Nabha can exceed 400 µg/m³, triggering acute bronchospasm, asthma attacks, and cardiovascular stress in senior citizens.
          </p>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <p className="text-xs font-bold text-red-400">Harvest Season Clinical Action Plan:</p>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Keep Salbutamol / Budesonide rescue inhaler verified & in-date</li>
              <li>• Nebulization therapy available 24/7 at Civil Hospital Nabha Emergency</li>
              <li>• Wear triple-layer N95 masks when driving through rural highway corridors</li>
            </ul>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info size={14} className="text-red-400" /> Generic Salbutamol inhalers available at Jan Aushadhi Kendra for ₹60.
          </div>
        </div>
      </div>

      {/* Bottom Section: 12-Month Epidemiological Disease Calendar Graph */}
      <div
        className="p-6 rounded-2xl space-y-5"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-500/20 text-indigo-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Punjab Seasonal Disease Vulnerability Cycle (12-Month Analysis)</h4>
              <p className="text-xs text-slate-400">Historical disease trend patterns across Patiala & Malwa region</p>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PUNJAB_DISEASE_CYCLE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVector" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAgro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a18',
                  border: '1px solid #2a2a40',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) => {
                  if (value === 'vectorBorne') return 'Dengue & Malaria (Vector-Borne)';
                  if (value === 'respiratory') return 'Stubble Smoke & Asthma (Respiratory)';
                  if (value === 'agroChemical') return 'Pesticide Spray Season (Toxicity Risk)';
                  return value;
                }}
              />
              <Area type="monotone" dataKey="vectorBorne" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorVector)" />
              <Area type="monotone" dataKey="respiratory" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorResp)" />
              <Area type="monotone" dataKey="agroChemical" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAgro)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

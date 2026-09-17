'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  Building2,
  FileCheck,
  ExternalLink,
  Phone,
  RefreshCw,
  HeartHandshake,
  Users,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '@/components/primitives';

interface SchemeResult {
  id: string;
  name: string;
  punjabiName: string;
  badge: string;
  coverageAmount: string;
  eligible: boolean;
  reason: string;
  requiredDocuments: string[];
  nearestEnrolmentNabha: string;
  hotline: string;
  benefits: string[];
}

export default function SchemeCheckerPage() {
  // Assessment criteria
  const [rationCardType, setRationCardType] = useState<'yellow' | 'blue' | 'pink' | 'none'>('blue');
  const [isFarmerWithJForm, setIsFarmerWithJForm] = useState<boolean>(true);
  const [landHoldingAcres, setLandHoldingAcres] = useState<number>(3);
  const [familyAnnualIncome, setFamilyAnnualIncome] = useState<number>(180000);
  const [hasSeniorCitizen, setHasSeniorCitizen] = useState<boolean>(true);
  const [hasPregnantOrInfant, setHasPregnantOrInfant] = useState<boolean>(false);
  const [hasHepatitisOrDialysis, setHasHepatitisOrDialysis] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);

  // Evaluate eligibility logic
  const handleEvaluate = () => {
    setEvaluated(true);
  };

  const schemes: SchemeResult[] = [
    {
      id: 'mmsby',
      name: 'Ayushman Bharat — Mukh Mantri Sehat Bima Yojana (MMSBY)',
      punjabiName: 'ਮੁੱਖ ਮੰਤਰੀ ਸਿਹਤ ਬੀਮਾ ਯੋਜਨਾ',
      badge: 'Punjab State Flagship',
      coverageAmount: '₹5,00,000 / Year Cashless',
      eligible: rationCardType !== 'none' || isFarmerWithJForm || familyAnnualIncome <= 500000 || hasSeniorCitizen,
      reason: isFarmerWithJForm
        ? 'Eligible as a Registered J-Form Farmer under Mandi Board quota.'
        : rationCardType !== 'none'
        ? 'Eligible as NFSA / Blue / Yellow Ration Card holder category.'
        : 'Eligible based on income criteria under Punjab State Health Agency guidelines.',
      benefits: [
        '1,600+ secondary and tertiary medical treatments covered',
        'Empanelled in Civil Hospital Nabha, Rajindra Hospital Patiala, and Vardaan Hospital',
        'Pre-existing conditions covered from Day 1 with zero waiting period',
        'Diagnostic tests, surgery, ICU, and 15 days post-discharge medicines included',
      ],
      requiredDocuments: ['Aadhaar Card of all family members', 'Ration Card or J-Form copy', 'Active Punjab Mobile Number'],
      nearestEnrolmentNabha: 'Sewa Kendra, Opposite Tehsil Office, Nabha (Counter 4) or Civil Hospital Helpdesk',
      hotline: '14555 / 104',
    },
    {
      id: 'bpssby',
      name: 'Bhagat Puran Singh Sehat Bima Yojana (BPSSBY)',
      punjabiName: 'ਭਗਤ ਪੂਰਨ ਸਿੰਘ ਸਿਹਤ ਬੀਮਾ ਯੋਜਨਾ',
      badge: 'Farmers & Small Traders',
      coverageAmount: '₹50,000 Medical + ₹5 Lakh Accidental Cover',
      eligible: isFarmerWithJForm || rationCardType === 'blue' || landHoldingAcres <= 5,
      reason: 'Eligible under Small/Marginal Farmer and Blue Card family quota in Punjab.',
      benefits: [
        'Cashless in-patient hospitalization up to ₹50,000',
        'Accidental death or permanent disability coverage of ₹5 Lakh for family head',
        'Smart biometric card accepted across district public and private hospitals',
      ],
      requiredDocuments: ['Punjab Mandi Board J-Form', 'Aadhaar Card', 'Bank Passbook Copy'],
      nearestEnrolmentNabha: 'Market Committee Office, Grain Market (Dana Mandi), Nabha',
      hotline: '1800-180-2444',
    },
    {
      id: 'hepatitis',
      name: 'Mukh Mantri Punjab Hepatitis C Relief Fund (MMPHCRF)',
      punjabiName: 'ਮੁੱਖ ਮੰਤਰੀ ਹੈਪੇਟਾਈਟਸ-ਸੀ ਰਾਹਤ ਫੰਡ',
      badge: '100% Free DAA Cure',
      coverageAmount: 'Full Cost of Diagnostics & Antiviral Course (~₹45,000 Free)',
      eligible: true, // Universal for all Punjab residents
      reason: 'Universal Punjab resident entitlement regardless of income or landholding.',
      benefits: [
        'Free Viral Load Quantitative PCR testing',
        '12-week or 24-week Direct Acting Antiviral (Sofosbuvir + Velpatasvir) oral tablets',
        '100% cure rate under medical supervision at Civil Hospital Nabha',
      ],
      requiredDocuments: ['Punjab Domicile Proof / Aadhaar Card', 'Positive Anti-HCV screening test report'],
      nearestEnrolmentNabha: 'Civil Hospital Nabha (Room 12, Anti-HCV Cell)',
      hotline: '0175-2212058 (District Viral Cell Patiala)',
    },
    {
      id: 'dialysis',
      name: 'Pradhan Mantri National Dialysis Programme',
      punjabiName: 'ਮੁਫ਼ਤ ਡਾਇਲਸਿਸ ਪ੍ਰੋਗਰਾਮ',
      badge: 'Zero-Cost Dialysis',
      coverageAmount: '100% Free Hemodialysis Sessions',
      eligible: hasHepatitisOrDialysis || familyAnnualIncome <= 300000 || rationCardType !== 'none',
      reason: 'Covered under the National Dialysis Programme for BPL and low-income Punjab residents.',
      benefits: [
        'Free hemodialysis sessions including dialyzer and heparin',
        'Regular nephrology follow-up at Sub-Divisional Hospital (SDH) Nabha and Rajindra Hospital Patiala',
      ],
      requiredDocuments: ['Nephrologist prescription', 'Aadhaar Card', 'Income Certificate or Ration Card'],
      nearestEnrolmentNabha: 'Dialysis Unit, Sub-Divisional Hospital Nabha',
      hotline: '104 (Punjab Health Helpline)',
    },
    {
      id: 'jssk',
      name: 'Janani Shishu Suraksha Karyakram (JSSK)',
      punjabiName: 'ਜਣਨੀ ਸ਼ਿਸ਼ੂ ਸੁਰੱਖਿਆ ਕਾਰਜਕ੍ਰਮ',
      badge: 'Maternal & Infant Entitlement',
      coverageAmount: '100% Free Delivery, C-Section & Childcare',
      eligible: hasPregnantOrInfant,
      reason: hasPregnantOrInfant
        ? 'Eligible: Expecting mothers and infants up to 1 year receive 100% free care.'
        : 'Available for all pregnant women and sick infants under 1 year.',
      benefits: [
        'Zero expenses for normal delivery or emergency Caesarean section',
        'Free medicines, consumables, blood transfusion, and clinical diagnostic lab tests',
        'Free food/diet during hospital stay (up to 3 days normal, 7 days C-section)',
        'Free 108 ambulance pickup from home to hospital and drop back',
      ],
      requiredDocuments: ['Mother-Child Protection (MCP) Card / RCH ID', 'Aadhaar Card'],
      nearestEnrolmentNabha: 'Maternity Ward, Civil Hospital Nabha',
      hotline: '108 (Free Emergency Transport)',
    },
    {
      id: 'pmbjp',
      name: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)',
      punjabiName: 'ਜਨ ਔਸ਼ਧੀ ਯੋਜਨਾ',
      badge: 'Affordable Medicine Right',
      coverageAmount: '50% to 90% Price Subsidy',
      eligible: true,
      reason: 'Universal open access for all patients with any valid medical prescription.',
      benefits: [
        '1,800+ generic medicines and 290+ surgical consumables at subsidized rates',
        'Immediate walk-in purchase at Nabha certified Jan Aushadhi Kendras',
        'Quality tested by NABL accredited laboratories',
      ],
      requiredDocuments: ['Doctor Prescription (Printed or Handwritten)'],
      nearestEnrolmentNabha: 'Jan Aushadhi Kendra, Main Market Road (Near Civil Hospital), Nabha',
      hotline: '1800-180-8080',
    },
  ];

  const eligibleCount = schemes.filter((s) => s.eligible).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <SectionHeader
        title="Punjab Government Health Scheme Eligibility"
        subtitle="Check in 60 seconds which free healthcare schemes you and your family qualify for in Punjab — including Ayushman Bharat Mukh Mantri Sehat Bima Yojana, Free Dialysis, and Hepatitis-C Relief."
      />

      {/* Criteria Card Form */}
      <div
        className="p-6 rounded-2xl space-y-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-500/20 text-indigo-400">
            <Landmark size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Family Profile & Socio-Economic Criteria</h3>
            <p className="text-xs text-slate-400">Select your household details to calculate scheme eligibility accurately.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Ration Card */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Ration Card Type in Punjab:</label>
            <select
              value={rationCardType}
              onChange={(e: any) => setRationCardType(e.target.value)}
              className="w-full p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              style={{
                background: 'rgba(15,15,30,0.8)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="blue">Blue Card (NFSA / Atta-Dal Scheme)</option>
              <option value="yellow">Yellow Card (Below Poverty Line - BPL)</option>
              <option value="pink">Pink Card (Antyodaya Anna Yojana - AAY)</option>
              <option value="none">No Ration Card / General Category</option>
            </select>
          </div>

          {/* Farmer J-Form */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Agricultural Farmer Status:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFarmerWithJForm(true)}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all border ${
                  isFarmerWithJForm
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                    : 'bg-black/30 border-white/5 text-slate-400'
                }`}
              >
                Yes, have J-Form
              </button>
              <button
                type="button"
                onClick={() => setIsFarmerWithJForm(false)}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all border ${
                  !isFarmerWithJForm
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                    : 'bg-black/30 border-white/5 text-slate-400'
                }`}
              >
                Non-Farmer / Other
              </button>
            </div>
          </div>

          {/* Landholding */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Landholding Size (Acres):</label>
            <input
              type="number"
              min={0}
              max={100}
              value={landHoldingAcres}
              onChange={(e) => setLandHoldingAcres(Number(e.target.value))}
              className="w-full p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              style={{
                background: 'rgba(15,15,30,0.8)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Annual Income */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Annual Family Income (₹):</label>
            <select
              value={familyAnnualIncome}
              onChange={(e) => setFamilyAnnualIncome(Number(e.target.value))}
              className="w-full p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              style={{
                background: 'rgba(15,15,30,0.8)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-primary)',
              }}
            >
              <option value={100000}>Below ₹1,00,000 / year</option>
              <option value={180000}>₹1,00,000 - ₹2,50,000 / year</option>
              <option value={400000}>₹2,50,000 - ₹5,00,000 / year</option>
              <option value={800000}>Above ₹5,00,000 / year</option>
            </select>
          </div>

          {/* Special Demographics Checkboxes */}
          <div className="space-y-2 md:col-span-2 flex flex-col justify-end">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={hasSeniorCitizen}
                  onChange={(e) => setHasSeniorCitizen(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                Senior (70+ Age) in family
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={hasPregnantOrInfant}
                  onChange={(e) => setHasPregnantOrInfant(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                Pregnant mother / Infant &lt; 1 yr
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={hasHepatitisOrDialysis}
                  onChange={(e) => setHasHepatitisOrDialysis(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                Chronic Kidney / Hepatitis C
              </label>
            </div>
          </div>
        </div>

        {/* Calculate button */}
        <div className="pt-2">
          <button
            onClick={handleEvaluate}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-lg hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
          >
            <ShieldCheck size={18} /> Check All Applicable Schemes ({schemes.length})
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Your Qualified Health Schemes</h3>
            <p className="text-xs text-slate-400">
              Matched against Punjab State Health Agency (SHA) rules. You qualify for{' '}
              <strong className="text-emerald-400">{eligibleCount} out of {schemes.length}</strong> government entitlements.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {eligibleCount} Schemes Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {schemes.map((scheme) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl flex flex-col justify-between space-y-4 border transition-all ${
                scheme.eligible
                  ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-black/80'
                  : 'border-slate-800 bg-black/40 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {scheme.badge}
                  </span>
                  {scheme.eligible ? (
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Eligible
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      Criteria Not Met
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-base text-white">{scheme.name}</h4>
                  <p className="text-xs text-amber-400/90 font-medium">{scheme.punjabiName}</p>
                  <p className="text-sm font-black text-emerald-300 mt-1">{scheme.coverageAmount}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <strong>Status: </strong> {scheme.reason}
                </p>

                {/* Benefits */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Covered Benefits:</p>
                  <ul className="space-y-1">
                    {scheme.benefits.map((b, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 text-sm leading-none">•</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Documents & Enrolment */}
              <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                <div className="text-slate-400">
                  <strong className="text-slate-200">Required: </strong>
                  {scheme.requiredDocuments.join(', ')}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-200">Nabha Centre: </strong>
                  {scheme.nearestEnrolmentNabha}
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <a
                    href={`tel:${scheme.hotline.replace(/\D/g, '')}`}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Phone size={13} /> Helpline: {scheme.hotline}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

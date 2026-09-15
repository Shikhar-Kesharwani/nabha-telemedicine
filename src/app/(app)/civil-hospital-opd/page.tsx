'use client';

import { useState, useEffect } from "react";
import { Phone, MapPin, Clock, CalendarDays, Building2, Info, ExternalLink, ShieldCheck, Pill, ArrowUp } from "lucide-react";
import { SectionHeader, StatusBadge } from "@/components/primitives";

const OPD_SCHEDULE = [
  {
    department: "General Medicine / OPD",
    specialist: "Resident Medical Officers",
    days: "Monday – Saturday",
    timing: "9:00 AM – 1:00 PM",
    color: "var(--accent-emerald)",
    icon: "🩺",
    note: "Walk-in. Free consultation for all under Aam Aadmi Clinic scheme."
  },
  {
    department: "Cardiology (Visiting)",
    specialist: "Visiting Cardiologist — Rajindra Hospital",
    days: "Every Tuesday & Friday",
    timing: "10:00 AM – 12:30 PM",
    color: "var(--accent-red)",
    icon: "❤️",
    note: "Token system — arrive by 9:30 AM. Sehat Card accepted."
  },
  {
    department: "Gynecology & Maternity",
    specialist: "Dr. (Lady) Resident Gynecologist",
    days: "Monday – Saturday",
    timing: "9:00 AM – 1:00 PM",
    color: "#ec4899",
    icon: "🤱",
    note: "Antenatal care, delivery, and family planning services available."
  },
  {
    department: "Pediatrics (Child Health)",
    specialist: "Visiting Pediatrician",
    days: "Monday, Wednesday, Friday",
    timing: "10:00 AM – 12:00 PM",
    color: "#f59e0b",
    icon: "👶",
    note: "Immunization available daily 9 AM–11 AM under universal immunization program."
  },
  {
    department: "ENT (Ear, Nose, Throat)",
    specialist: "Visiting ENT Specialist",
    days: "Every Tuesday",
    timing: "10:00 AM – 12:00 PM",
    color: "var(--accent-cyan)",
    icon: "👂",
    note: "Limited tokens — arrive early. Free basic audiometry."
  },
  {
    department: "Eye / Ophthalmology",
    specialist: "Visiting Ophthalmologist",
    days: "Every Thursday",
    timing: "9:30 AM – 12:00 PM",
    color: "#8b5cf6",
    icon: "👁️",
    note: "Free cataract screening. Glasses check on first-come basis."
  },
  {
    department: "Dental / Oral Health",
    specialist: "Dental Officer",
    days: "Monday – Friday",
    timing: "9:00 AM – 1:00 PM",
    color: "#06b6d4",
    icon: "🦷",
    note: "Extractions and basic dental treatment available. Free under PMJAY."
  },
  {
    department: "Orthopedics",
    specialist: "Visiting Orthopedic Surgeon",
    days: "Every Wednesday",
    timing: "10:00 AM – 12:00 PM",
    color: "#d97706",
    icon: "🦴",
    note: "Fractures, joint pain, physiotherapy referrals. Plaster services available."
  },
  {
    department: "Dermatology (Skin)",
    specialist: "Visiting Dermatologist",
    days: "Every Monday",
    timing: "10:00 AM – 12:00 PM",
    color: "#10b981",
    icon: "🧴",
    note: "Skin conditions, fungal infections, allergies. Free medicines under EDL."
  },
  {
    department: "TB / DOTS Clinic",
    specialist: "RNTCP Medical Officer",
    days: "Monday – Saturday",
    timing: "9:00 AM – 11:00 AM",
    color: "#f97316",
    icon: "🫁",
    note: "Tuberculosis screening (CBNAAT sputum test) and DOTS treatment — completely FREE."
  },
];

const FREE_SERVICES = [
  { name: "Jan Aushadhi Kendra", desc: "Generic medicines at 50–90% less than branded price. Inside hospital campus.", icon: <Pill size={18} /> },
  { name: "Free Diagnostics (100+ tests)", desc: "Under Aam Aadmi Clinic scheme: CBC, blood sugar, urine, X-ray and more.", icon: "🧪" },
  { name: "Emergency & Trauma", desc: "24/7 emergency room with ambulance coordination (108).", icon: "🚨" },
  { name: "Sehat Card (MMSBY)", desc: "Cashless treatment up to ₹10 lakh/year. Accepted here. Helpline: 14555.", icon: <ShieldCheck size={18} /> },
  { name: "Mukh Mantri Cancer Rahat Kosh", desc: "Financial aid up to ₹1.5 lakh for cancer treatment. Apply at hospital admin.", icon: "🎗️" },
  { name: "Immunization (NHM)", desc: "Free childhood vaccines, Hepatitis B, Tetanus — daily 9–11 AM.", icon: "💉" },
];

export default function CivilHospitalOpdPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Civil Hospital Nabha — OPD Guide"
        subtitle="Lt. Gen. Shivdev Singh Sub-Divisional Hospital (SDH), Nabha — your primary government healthcare centre."
        action={<StatusBadge variant="emerald"><Building2 size={13} strokeWidth={2.5} /> Government Hospital</StatusBadge>}
      />

      {/* Hospital Info Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent-emerald)]/30 bg-gradient-to-br from-[#050f0a] to-[#0d0d1a] p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--accent-emerald)]/15 flex items-center justify-center text-3xl">
            🏥
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="font-display text-xl font-black text-[var(--text-primary)]">
              Lt. Gen. Shivdev Singh Civil Hospital
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Sub-Divisional Hospital (SDH) · Government of Punjab · Patiala District</p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--accent-emerald)]" />
                Guru Nanak Pura Mohalla, Near Bus Stand, Nabha — 147201
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[var(--accent-emerald)]" />
                Emergency: 24 × 7 · OPD: 9 AM – 1 PM (Mon–Sat)
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="tel:01765-220041"
              className="flex items-center gap-2 rounded-xl bg-[var(--accent-emerald)] px-4 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-all"
            >
              <Phone size={14} /> 01765-220041
            </a>
            <a
              href="https://maps.google.com/?q=Civil+Hospital+Nabha+Punjab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-white/10 transition-all"
            >
              <ExternalLink size={14} /> Get Directions
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/8 p-3.5 flex items-start gap-2.5">
          <Info size={16} className="text-[var(--accent-amber)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--accent-amber)]">
            <strong>Tip:</strong> For visiting specialist OPDs, arrive at least 30 minutes early to collect your token. Tokens are limited. Bring your Sehat Card (Ayushman card) and Aadhaar for cashless treatment.
          </p>
        </div>
      </div>

      {/* OPD Schedule */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-[var(--accent-cyan)]" />
          <h3 className="font-bold text-base text-[var(--text-primary)]">Department OPD Schedule</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPD_SCHEDULE.map((dept, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-[var(--surface)] p-5 space-y-3 hover:scale-[1.01] transition-transform"
              style={{ borderColor: `${dept.color}33` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: `${dept.color}18` }}
                  >
                    {dept.icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{dept.department}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{dept.specialist}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[var(--surface-2)] p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Days</p>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{dept.days}</p>
                </div>
                <div className="rounded-lg bg-[var(--surface-2)] p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Timing</p>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{dept.timing}</p>
                </div>
              </div>

              {dept.note && (
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-2.5">
                  ℹ️ {dept.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Free Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[var(--accent-emerald)]" />
          <h3 className="font-bold text-base text-[var(--text-primary)]">Free Services at Civil Hospital Nabha</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FREE_SERVICES.map((service, index) => (
            <div key={index} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-[var(--accent-emerald)] text-xl">
                  {typeof service.icon === 'string' ? service.icon : service.icon}
                </span>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">{service.name}</h4>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Info */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
        <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
          <span>🏛️</span> Need a Specialist? Nearest Referral Centres
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Rajindra Govt Hospital", city: "Patiala", dist: "28 km · ~35 min", phone: "0175-2212058", tag: "Primary Referral" },
            { name: "Homi Bhabha Cancer Hospital", city: "Sangrur", dist: "38 km · ~45 min", phone: "01672-523100", tag: "Cancer / Oncology" },
            { name: "PGIMER", city: "Chandigarh", dist: "90 km · ~2 hrs", phone: "0172-2756565", tag: "Super Speciality" },
          ].map((ref, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-2">
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">{ref.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{ref.city} · {ref.dist}</p>
              </div>
              <span className="inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">{ref.tag}</span>
              <a
                href={`tel:${ref.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent-emerald)] hover:underline"
              >
                <Phone size={12} /> {ref.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--border-bright)] text-[var(--accent-emerald)] shadow-2xl hover:scale-110 hover:border-[var(--accent-emerald)] transition-all"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, ShieldCheck } from "lucide-react";
import { SectionHeader, StatusBadge, RatingStars } from "@/components/primitives";
import { getDoctors, type Doctor } from "@/lib/services/doctors";

export default function VoiceCallListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    async function fetchData() {
      const fetched = await getDoctors();
      setDoctors(fetched);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="WebRTC Voice Tele-Consultations"
        subtitle="Select a doctor to initiate a low-latency encrypted audio tele-consultation."
        action={<StatusBadge variant="violet"><ShieldCheck size={13} /> Crystal Audio</StatusBadge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-lg">
                  {(doc.name || doc.fullName).charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{doc.name || doc.fullName}</h3>
                  <p className="text-xs font-semibold text-[var(--accent-violet)]">{doc.specialty}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                <RatingStars rating={doc.rating} reviewCount={doc.reviews} />
                <StatusBadge variant="violet">Voice Ready</StatusBadge>
              </div>
            </div>

            <Link
              href={`/voice-call/${doc.id}`}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:opacity-95"
            >
              <Mic size={15} /> Start Voice Call
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

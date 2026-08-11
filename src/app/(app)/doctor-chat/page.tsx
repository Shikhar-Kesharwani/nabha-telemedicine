'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Search, Sparkles, ShieldCheck } from "lucide-react";
import { SectionHeader, StatusBadge, RatingStars } from "@/components/primitives";
import { getDoctors, type Doctor } from "@/lib/services/doctors";

export default function DoctorChatListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      const fetched = await getDoctors();
      setDoctors(fetched);
    }
    fetchData();
  }, []);

  const filtered = doctors.filter(
    (d) => (d.name || d.fullName).toLowerCase().includes(query.toLowerCase()) || d.specialty.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Consult a Specialist via Chat"
        subtitle="Start an instant end-to-end encrypted direct text session with board-certified physicians."
        action={<StatusBadge variant="violet"><ShieldCheck size={13} /> 256-Bit Encrypted</StatusBadge>}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by doctor name or specialty..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-violet)] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div key={doc.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-lg">
                      {(doc.name || doc.fullName).charAt(0)}
                    </div>
                    <span className="glow-dot-green absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{doc.name || doc.fullName}</h3>
                    <p className="text-xs font-semibold text-[var(--accent-violet)]">{doc.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                <RatingStars rating={doc.rating} reviewCount={doc.reviews} />
                <span className="text-xs font-bold text-[var(--accent-emerald)]">Online Now</span>
              </div>
            </div>

            <Link
              href={`/doctor-chat/${doc.id}`}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:opacity-95"
            >
              <MessageSquare size={15} /> Start Direct Chat
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

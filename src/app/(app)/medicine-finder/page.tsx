'use client';

import { useState, useEffect } from "react";
import { Pill, Search, ShieldCheck } from "lucide-react";
import { SectionHeader, StatusBadge } from "@/components/primitives";
import { getActiveSubscriptions, toggleSubscription, type StockNotification } from "@/lib/services/medicine-subscriptions";
import { getMedicines, type Medicine } from "@/lib/services/medicines";
import { useToast } from "@/hooks/use-toast";

function getSession() {
  if (typeof window === 'undefined') return null;
  const patientSession = localStorage.getItem('sehat-session-patient');
  if (patientSession) return { type: 'patient', ...JSON.parse(patientSession) };
  return null;
}

export default function MedicineFinderPage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [subscriptions, setSubscriptions] = useState<StockNotification[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const session = getSession();
    if (session?.email) setUserEmail(session.email);
  }, []);

  useEffect(() => {
    async function loadData() {
      const [meds, activeSubs] = await Promise.all([
        getMedicines(),
        getActiveSubscriptions(),
      ]);
      setMedicines(meds);
      setSubscriptions(activeSubs);
    }
    loadData();
  }, []);

  const filtered = medicines.filter(
    (m) =>
      m.brandName.toLowerCase().includes(query.toLowerCase()) ||
      m.chemicalName.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleNotifyToggle = async (med: Medicine) => {
    if (!userEmail) {
      toast({ variant: "destructive", title: "Login Required", description: "Please sign in to set stock notifications." });
      return;
    }
    await toggleSubscription(userEmail, med.brandName, med.pharmacyName);
    const updated = await getActiveSubscriptions();
    setSubscriptions(updated);

    toast({
      title: "Stock Alert Updated! 🔔",
      description: `Notification preference toggled for ${med.brandName}.`,
    });
  };

  const isSubscribed = (medName: string) => subscriptions.some(s => s.medicine_name === medName);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Jan Aushadhi Generic Medicine Finder"
        subtitle="Search government generic drug inventory in SQLite DB, check real-time stock availability, and subscribe to stock alerts."
        action={<StatusBadge variant="emerald"><ShieldCheck size={13} /> Jan Aushadhi SQLite Connected</StatusBadge>}
      />

      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand name, generic chemical composition, or medical category..."
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-emerald)] focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((med) => {
          const subscribed = isSubscribed(med.brandName);
          return (
            <div
              key={med.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 card-3d-hover"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] font-bold">
                    <Pill size={18} />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{med.brandName}</h3>
                    <p className="text-xs font-semibold text-[var(--accent-cyan)]">{med.chemicalName}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] pt-1">
                  Category: <span className="text-[var(--text-primary)] font-semibold">{med.category}</span> • Store: <span className="text-[var(--text-primary)] font-semibold">{med.pharmacyName}</span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[var(--border)] pt-3 md:pt-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Jan Aushadhi Price</p>
                  <p className="text-lg font-extrabold text-[var(--accent-emerald)]">₹{med.priceRupees}</p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge variant={med.inStock ? "emerald" : "red"}>
                    {med.inStock ? "In Stock" : "Out of Stock"}
                  </StatusBadge>

                  <button
                    onClick={() => handleNotifyToggle(med)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                      subscribed
                        ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white shadow-md'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-white/5'
                    }`}
                  >
                    {subscribed ? "✓ Alert Set" : "Notify Me"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

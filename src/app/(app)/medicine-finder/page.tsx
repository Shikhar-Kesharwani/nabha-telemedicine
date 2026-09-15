'use client';

import { useState, useEffect } from "react";
import { Pill, Search, ShieldCheck } from "lucide-react";
import { SectionHeader, StatusBadge } from "@/components/primitives";
import { getActiveSubscriptions, toggleSubscription, type StockNotification } from "@/lib/services/medicine-subscriptions";
import { getMedicines, type Medicine } from "@/lib/services/medicines";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/session";

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

      {/* Brand-to-Generic Price Difference Calculator Widget */}
      <div className="rounded-3xl border border-[var(--accent-emerald)]/30 bg-gradient-to-br from-[#06150e] to-[#0d0d1a] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧮</span>
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">Jan Aushadhi Brand-to-Generic Price Calculator</h3>
            <p className="text-xs text-[var(--text-muted)]">Compare branded doctor prescriptions with Jan Aushadhi generic substitutes in Nabha.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { branded: "Augmentin 625mg", brandPrice: 204, generic: "Amoxicillin + Clav 625mg", genericPrice: 52, store: "Jan Aushadhi Central Nabha" },
            { branded: "Glucophage 500mg", brandPrice: 180, generic: "Metformin 500mg", genericPrice: 18, store: "Jan Aushadhi Central Nabha" },
            { branded: "Lipitor 10mg", brandPrice: 240, generic: "Atorvastatin 10mg", genericPrice: 28, store: "Jan Aushadhi Model Town" },
            { branded: "Pantocid 40mg", brandPrice: 165, generic: "Pantoprazole 40mg", genericPrice: 22, store: "Jan Aushadhi Model Town" },
            { branded: "Calpol / Crocin 500", brandPrice: 40, generic: "Paracetamol 500mg", genericPrice: 12, store: "Jan Aushadhi Central Nabha" },
            { branded: "Allegra 120mg", brandPrice: 210, generic: "Cetirizine 10mg", genericPrice: 10, store: "Jan Aushadhi Central Nabha" },
          ].map((item, idx) => {
            const savings = item.brandPrice - item.genericPrice;
            const percent = Math.round((savings / item.brandPrice) * 100);
            return (
              <div key={idx} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] line-through">Branded: {item.branded} (₹{item.brandPrice})</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold bg-[var(--accent-emerald)]/15 text-[var(--accent-emerald)] border border-[var(--accent-emerald)]/30">
                    Save {percent}%
                  </span>
                </div>
                <p className="font-extrabold text-sm text-[var(--text-primary)]">{item.generic}</p>
                <div className="flex items-baseline justify-between pt-1 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">{item.store}</span>
                  <span className="text-sm font-black text-[var(--accent-emerald)]">
                    ₹{item.genericPrice} <span className="text-[10px] font-normal text-[var(--text-muted)]">(Save ₹{savings})</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-3">
            <Pill className="mx-auto h-12 w-12 text-[var(--text-muted)] opacity-40" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">No Medicines Found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              No government generic medicines match &quot;{query}&quot;. Try searching by chemical composition (e.g., Metformin, Amoxicillin, Paracetamol) or check back after the next Jan Aushadhi consignment arrives.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

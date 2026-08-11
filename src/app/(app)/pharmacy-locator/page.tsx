'use client';

import { useState, useEffect } from "react";
import { MapPin, Phone, Search, ShieldCheck, Navigation, Loader2 } from "lucide-react";
import { SectionHeader, StatusBadge } from "@/components/primitives";
import { getPharmacies, type Pharmacy } from "@/lib/services/pharmacies";
import { useToast } from "@/hooks/use-toast";

export default function PharmacyLocatorPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [query, setQuery] = useState("");
  const [only24x7, setOnly24x7] = useState(false);
  const [userLoc, setUserLoc] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadPharmacies() {
      const data = await getPharmacies();
      setPharmacies(data);
    }
    loadPharmacies();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Geolocation Unsupported", description: "Browser geolocation is not available." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Free OpenStreetMap Nominatim Reverse Geocoding
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const json = await res.json();
          const placeName = json.address?.city || json.address?.town || json.address?.suburb || json.address?.county || "Nabha Region";
          setUserLoc(placeName);
          toast({ title: "Location Detected! 📍", description: `Showing pharmacies near ${placeName} (${latitude.toFixed(3)}, ${longitude.toFixed(3)}).` });
        } catch {
          setUserLoc("Nabha Region");
          toast({ title: "GPS Detected 📍", description: `Coordinates: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}.` });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast({ variant: "destructive", title: "Location Permission Denied", description: "Defaulting to Nabha, Punjab area." });
      }
    );
  };

  const filtered = pharmacies.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(query.toLowerCase()) || p.address.toLowerCase().includes(query.toLowerCase());
    const match24 = only24x7 ? p.is24x7 : true;
    return matchQ && match24;
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title="24/7 Jan Aushadhi & Chemist Finder"
        subtitle={userLoc ? `Showing stores near ${userLoc} (Connected to SQLite DB)` : "Locate government-approved generic drug stores and 24/7 emergency pharmacies."}
        action={<StatusBadge variant="emerald"><ShieldCheck size={13} /> Jan Aushadhi SQLite Connected</StatusBadge>}
      />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pharmacy name or street location..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-emerald)] focus:outline-none"
          />
        </div>

        <button
          onClick={detectLocation}
          disabled={locating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-white/5 transition-colors"
        >
          {locating ? <Loader2 size={15} className="animate-spin text-[var(--accent-cyan)]" /> : <Navigation size={15} className="text-[var(--accent-cyan)]" />}
          {locating ? "Detecting GPS..." : "Detect Live GPS"}
        </button>

        <button
          onClick={() => setOnly24x7(!only24x7)}
          className={`w-full sm:w-auto rounded-xl px-4 py-2.5 text-xs font-bold transition-colors border ${
            only24x7
              ? 'bg-[var(--accent-emerald)] border-[var(--accent-emerald)] text-black shadow-md'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-white/5'
          }`}
        >
          24/7 Open Only
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between card-3d-hover space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{p.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
                    <MapPin size={13} className="shrink-0 text-[var(--accent-emerald)]" />
                    <span>{p.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <StatusBadge variant={p.isOpen ? "emerald" : "red"}>
                  {p.isOpen ? "Open Now" : "Closed"}
                </StatusBadge>
                {p.is24x7 && <StatusBadge variant="cyan">24/7 Open</StatusBadge>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`tel:${p.phone}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-emerald)]/30 bg-[var(--accent-emerald)]/10 py-2.5 text-xs font-bold text-[var(--accent-emerald)] hover:bg-[var(--accent-emerald)]/20 transition-colors"
              >
                <Phone size={14} /> Call Chemist
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + p.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              >
                <Navigation size={14} /> Map Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

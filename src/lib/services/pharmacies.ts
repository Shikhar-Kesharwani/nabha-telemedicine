'use server';

import db from '@/lib/db';

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  is24x7: boolean;
  isOpen: boolean;
  lat?: number;
  lng?: number;
}

export async function getPharmacies(): Promise<Pharmacy[]> {
  const stmt = db.prepare('SELECT * FROM pharmacies');
  const rows = stmt.all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    address: r.address,
    phone: r.phone,
    is24x7: Boolean(r.is24x7),
    isOpen: Boolean(r.isOpen),
    lat: r.lat,
    lng: r.lng,
  }));
}

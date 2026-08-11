'use server';

import db from '@/lib/db';

export interface Medicine {
  id: number;
  brandName: string;
  chemicalName: string;
  category: string;
  priceRupees: number;
  inStock: boolean;
  pharmacyName: string;
}

export async function getMedicines(): Promise<Medicine[]> {
  const stmt = db.prepare('SELECT * FROM medicines');
  const rows = stmt.all() as any[];
  return rows.map(r => ({
    id: r.id,
    brandName: r.brandName,
    chemicalName: r.chemicalName,
    category: r.category,
    priceRupees: r.priceRupees,
    inStock: Boolean(r.inStock),
    pharmacyName: r.pharmacyName,
  }));
}

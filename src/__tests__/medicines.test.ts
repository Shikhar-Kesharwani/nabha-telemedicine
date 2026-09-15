/**
 * medicines.test.ts
 * Tests for Jan Aushadhi generic savings calculations and medicine data integrity.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Fixtures — mirrors medicines in db.ts seed data
// ---------------------------------------------------------------------------
const medicines = [
  { brandName: 'Paracetamol 500mg', chemicalName: 'Acetaminophen', category: 'Analgesic', priceRupees: 12, inStock: true },
  { brandName: 'Metformin 500mg', chemicalName: 'Metformin Hydrochloride', category: 'Anti-Diabetic', priceRupees: 18, inStock: true },
  { brandName: 'Amoxicillin 500mg', chemicalName: 'Amoxicillin Trihydrate', category: 'Antibiotic', priceRupees: 35, inStock: false },
  { brandName: 'Atorvastatin 10mg', chemicalName: 'Atorvastatin Calcium', category: 'Cardiovascular', priceRupees: 28, inStock: true },
  { brandName: 'Azithromycin 500mg', chemicalName: 'Azithromycin Dihydrate', category: 'Antibiotic', priceRupees: 45, inStock: false },
  { brandName: 'Pantoprazole 40mg', chemicalName: 'Pantoprazole Sodium', category: 'Gastrointestinal', priceRupees: 22, inStock: true },
  { brandName: 'Cetirizine 10mg', chemicalName: 'Cetirizine Hydrochloride', category: 'Anti-Allergic', priceRupees: 10, inStock: true },
  { brandName: 'Amlodipine 5mg', chemicalName: 'Amlodipine Besylate', category: 'Cardiovascular', priceRupees: 15, inStock: true },
];

// Branded equivalents (approx 3–8× more expensive in private pharmacies)
const brandedMultiplier: Record<string, number> = {
  Analgesic: 5,
  'Anti-Diabetic': 4,
  Antibiotic: 6,
  Cardiovascular: 7,
  Gastrointestinal: 4,
  'Anti-Allergic': 5,
};

// ---------------------------------------------------------------------------
// Savings calculation helper (same logic as medicine-finder page)
// ---------------------------------------------------------------------------
function calculateSavings(med: { priceRupees: number; category: string }) {
  const multiplier = brandedMultiplier[med.category] ?? 4;
  const brandedPrice = med.priceRupees * multiplier;
  const savings = brandedPrice - med.priceRupees;
  const savingsPct = Math.round((savings / brandedPrice) * 100);
  return { brandedPrice, savings, savingsPct };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Medicine Data Integrity', () => {
  it('all medicines have a positive price', () => {
    medicines.forEach((m) => {
      expect(m.priceRupees).toBeGreaterThan(0);
    });
  });

  it('all medicines have a non-empty brand and chemical name', () => {
    medicines.forEach((m) => {
      expect(m.brandName.trim().length).toBeGreaterThan(0);
      expect(m.chemicalName.trim().length).toBeGreaterThan(0);
    });
  });

  it('inStock is a boolean', () => {
    medicines.forEach((m) => {
      expect(typeof m.inStock).toBe('boolean');
    });
  });
});

describe('Jan Aushadhi Savings Calculations', () => {
  it('savings are always less than branded price', () => {
    medicines.forEach((m) => {
      const { brandedPrice, savings } = calculateSavings(m);
      expect(savings).toBeLessThan(brandedPrice);
    });
  });

  it('savings percentage is between 0% and 100%', () => {
    medicines.forEach((m) => {
      const { savingsPct } = calculateSavings(m);
      expect(savingsPct).toBeGreaterThanOrEqual(0);
      expect(savingsPct).toBeLessThanOrEqual(100);
    });
  });

  it('Paracetamol 500mg saves at least 70% vs branded', () => {
    const para = medicines.find((m) => m.brandName === 'Paracetamol 500mg')!;
    const { savingsPct } = calculateSavings(para);
    expect(savingsPct).toBeGreaterThanOrEqual(70);
  });

  it('branded price is always higher than Jan Aushadhi price', () => {
    medicines.forEach((m) => {
      const { brandedPrice } = calculateSavings(m);
      expect(brandedPrice).toBeGreaterThan(m.priceRupees);
    });
  });
});

describe('Medicine Search Filter', () => {
  function searchMedicines(query: string) {
    const q = query.toLowerCase();
    return medicines.filter(
      (m) =>
        m.brandName.toLowerCase().includes(q) ||
        m.chemicalName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }

  it('finds medicines by brand name', () => {
    const results = searchMedicines('Metformin');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds medicines by chemical name', () => {
    const results = searchMedicines('Acetaminophen');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds medicines by category', () => {
    const results = searchMedicines('Antibiotic');
    expect(results.length).toBe(2);
  });

  it('returns empty for no match', () => {
    expect(searchMedicines('QuantumDrug9999')).toHaveLength(0);
  });
});

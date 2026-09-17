/**
 * prescription-scanner.test.ts
 * Tests for Prescription OCR parsing and Jan Aushadhi generic substitution formulas.
 */

import { describe, it, expect } from 'vitest';
import { parsePrescriptionText } from '@/lib/services/prescription-scanner';

describe('Prescription Generic Matching', () => {
  it('maps Augmentin 625mg to Amoxicillin + Clavulanate with >70% savings', async () => {
    const rx = 'Tab Augmentin 625mg 1 tab BD x 5 days';
    const result = await parsePrescriptionText(rx);

    expect(result.items.length).toBeGreaterThan(0);
    const item = result.items.find((i) => i.genericEquivalent.includes('Amoxicillin'));
    expect(item).toBeDefined();
    expect(item?.savingsPercentage).toBeGreaterThanOrEqual(70);
    expect(item?.janAushadhiPrice).toBeLessThan(item!.brandedPriceEst);
  });

  it('identifies diabetes and hypertension generic medicines correctly', async () => {
    const rx = 'Glycomet 500mg and Atorva 10mg';
    const result = await parsePrescriptionText(rx);

    const metformin = result.items.find((i) => i.genericEquivalent.includes('Metformin'));
    const atorva = result.items.find((i) => i.genericEquivalent.includes('Atorvastatin'));

    expect(metformin).toBeDefined();
    expect(atorva).toBeDefined();
    expect(metformin?.janAushadhiPrice).toBe(18); // Government standard Jan Aushadhi price
  });

  it('calculates total prescription savings accurately', async () => {
    const rx = `Augmentin 625mg
Pantocid 40mg
Dolo 650mg`;
    const result = await parsePrescriptionText(rx);

    expect(result.totalBrandedCost).toBeGreaterThan(result.totalJanAushadhiCost);
    expect(result.totalSavings).toBe(result.totalBrandedCost - result.totalJanAushadhiCost);
    expect(result.overallSavingsPercentage).toBeGreaterThan(60);
  });

  it('includes verified Nabha certified Kendra location details', async () => {
    const result = await parsePrescriptionText('Pantocid 40mg');
    expect(result.nearestKendra.address).toContain('Nabha');
    expect(result.nearestKendra.phone).toBeDefined();
  });
});

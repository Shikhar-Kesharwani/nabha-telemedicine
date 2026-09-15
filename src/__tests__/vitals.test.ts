/**
 * vitals.test.ts
 * Tests for clinical boundary classification: BP, SpO2, pulse, blood glucose.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Clinical classification helpers (mirrors dashboard logic)
// ---------------------------------------------------------------------------
type BPStatus = 'Normal' | 'Elevated' | 'High Stage 1' | 'High Stage 2' | 'Hypertensive Crisis' | 'Low';
type SpO2Status = 'Normal' | 'Mild Hypoxia' | 'Moderate Hypoxia' | 'Severe Hypoxia';
type PulseStatus = 'Bradycardia' | 'Normal' | 'Tachycardia';
type GlucoseStatus = 'Hypoglycemia' | 'Normal' | 'Pre-Diabetic' | 'Diabetic';

function classifyBP(systolic: number, diastolic: number): BPStatus {
  if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
  if (systolic >= 140 || diastolic >= 90) return 'High Stage 2';
  if (systolic >= 130 || diastolic >= 80) return 'High Stage 1';
  if (systolic >= 120 && diastolic < 80) return 'Elevated';
  if (systolic < 90 || diastolic < 60) return 'Low';
  return 'Normal';
}

function classifySpO2(spO2: number): SpO2Status {
  if (spO2 >= 95) return 'Normal';
  if (spO2 >= 91) return 'Mild Hypoxia';
  if (spO2 >= 86) return 'Moderate Hypoxia';
  return 'Severe Hypoxia';
}

function classifyPulse(bpm: number): PulseStatus {
  if (bpm < 60) return 'Bradycardia';
  if (bpm > 100) return 'Tachycardia';
  return 'Normal';
}

function classifyGlucose(mgDl: number): GlucoseStatus {
  if (mgDl < 70) return 'Hypoglycemia';
  if (mgDl <= 99) return 'Normal';
  if (mgDl <= 125) return 'Pre-Diabetic';
  return 'Diabetic';
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Blood Pressure Classification', () => {
  it('classifies normal BP correctly', () => {
    expect(classifyBP(115, 75)).toBe('Normal');
  });

  it('classifies elevated BP (prehypertension)', () => {
    expect(classifyBP(123, 78)).toBe('Elevated');
  });

  it('classifies Stage 1 Hypertension', () => {
    expect(classifyBP(132, 82)).toBe('High Stage 1');
  });

  it('classifies Stage 2 Hypertension', () => {
    expect(classifyBP(145, 92)).toBe('High Stage 2');
  });

  it('classifies Hypertensive Crisis', () => {
    expect(classifyBP(185, 125)).toBe('Hypertensive Crisis');
  });

  it('classifies low BP (hypotension)', () => {
    expect(classifyBP(88, 58)).toBe('Low');
  });

  it('crisis triggered by diastolic alone', () => {
    expect(classifyBP(150, 121)).toBe('Hypertensive Crisis');
  });
});

describe('SpO2 Classification', () => {
  it('classifies normal oxygen saturation (≥95%)', () => {
    expect(classifySpO2(98)).toBe('Normal');
    expect(classifySpO2(95)).toBe('Normal');
  });

  it('classifies mild hypoxia (91-94%)', () => {
    expect(classifySpO2(93)).toBe('Mild Hypoxia');
  });

  it('classifies moderate hypoxia (86-90%)', () => {
    expect(classifySpO2(88)).toBe('Moderate Hypoxia');
  });

  it('classifies severe hypoxia (<86%)', () => {
    expect(classifySpO2(82)).toBe('Severe Hypoxia');
    expect(classifySpO2(70)).toBe('Severe Hypoxia');
  });
});

describe('Pulse / Heart Rate Classification', () => {
  it('classifies normal pulse (60-100 bpm)', () => {
    expect(classifyPulse(72)).toBe('Normal');
    expect(classifyPulse(60)).toBe('Normal');
    expect(classifyPulse(100)).toBe('Normal');
  });

  it('classifies bradycardia (<60 bpm)', () => {
    expect(classifyPulse(55)).toBe('Bradycardia');
    expect(classifyPulse(40)).toBe('Bradycardia');
  });

  it('classifies tachycardia (>100 bpm)', () => {
    expect(classifyPulse(110)).toBe('Tachycardia');
    expect(classifyPulse(150)).toBe('Tachycardia');
  });
});

describe('Blood Glucose Classification', () => {
  it('classifies normal glucose (70-99 mg/dL)', () => {
    expect(classifyGlucose(85)).toBe('Normal');
    expect(classifyGlucose(70)).toBe('Normal');
    expect(classifyGlucose(99)).toBe('Normal');
  });

  it('classifies hypoglycemia (<70 mg/dL)', () => {
    expect(classifyGlucose(65)).toBe('Hypoglycemia');
  });

  it('classifies pre-diabetic range (100-125 mg/dL)', () => {
    expect(classifyGlucose(110)).toBe('Pre-Diabetic');
  });

  it('classifies diabetic range (≥126 mg/dL)', () => {
    expect(classifyGlucose(145)).toBe('Diabetic');
    expect(classifyGlucose(300)).toBe('Diabetic');
  });
});

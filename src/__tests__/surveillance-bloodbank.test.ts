/**
 * surveillance-bloodbank.test.ts
 * Tests for Epidemiological cluster risk assessment and Blood transfusion compatibility rules.
 */

import { describe, it, expect } from 'vitest';

describe('Blood Transfusion Compatibility Rules', () => {
  const COMPATIBLE_DONORS_FOR_RECIPIENT: Record<string, string[]> = {
    'O-': ['O-'],
    'O+': ['O+', 'O-'],
    'A-': ['A-', 'O-'],
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal Recipient
  };

  it('O- recipient can only receive from O- universal donor', () => {
    const donors = COMPATIBLE_DONORS_FOR_RECIPIENT['O-'];
    expect(donors).toEqual(['O-']);
  });

  it('AB+ recipient is universal recipient and can receive from all 8 blood groups', () => {
    const donors = COMPATIBLE_DONORS_FOR_RECIPIENT['AB+'];
    expect(donors).toHaveLength(8);
    expect(donors).toContain('O-');
    expect(donors).toContain('AB+');
  });

  it('B+ recipient can receive from B+, B-, O+, and O-', () => {
    const donors = COMPATIBLE_DONORS_FOR_RECIPIENT['B+'];
    expect(donors).toContain('B+');
    expect(donors).toContain('B-');
    expect(donors).toContain('O+');
    expect(donors).toContain('O-');
    expect(donors).not.toContain('A+');
  });

  it('O- is compatible with all recipient blood groups', () => {
    const allGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    allGroups.forEach((recipient) => {
      expect(COMPATIBLE_DONORS_FOR_RECIPIENT[recipient]).toContain('O-');
    });
  });
});

describe('Epidemiological Surveillance Cluster Thresholds', () => {
  function determineRiskLevel(caseCount: number): 'LOW' | 'MODERATE' | 'ELEVATED' | 'OUTBREAK_WATCH' {
    if (caseCount >= 4) return 'OUTBREAK_WATCH';
    if (caseCount >= 2) return 'ELEVATED';
    if (caseCount >= 1) return 'MODERATE';
    return 'LOW';
  }

  it('flags 4 or more identical disease queries within 7 days as OUTBREAK_WATCH', () => {
    expect(determineRiskLevel(4)).toBe('OUTBREAK_WATCH');
    expect(determineRiskLevel(6)).toBe('OUTBREAK_WATCH');
  });

  it('flags 2-3 disease queries as ELEVATED cluster', () => {
    expect(determineRiskLevel(2)).toBe('ELEVATED');
    expect(determineRiskLevel(3)).toBe('ELEVATED');
  });

  it('flags 0 cases as LOW risk', () => {
    expect(determineRiskLevel(0)).toBe('LOW');
  });
});

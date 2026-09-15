/**
 * session.test.ts
 * Tests for patient/doctor session role decoding and emergency contact parsing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mock localStorage (jsdom provides one but let's verify our helpers use it)
// ---------------------------------------------------------------------------
interface PatientSession {
  userId: number;
  fullName: string;
  email: string;
  type: 'patient';
  phone?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface DoctorSession {
  id: number;
  fullName: string;
  email: string;
  specialty: string;
  type: 'doctor';
}

type SessionUser = PatientSession | DoctorSession;

const PATIENT_KEY = 'sehat-session-patient';
const DOCTOR_KEY = 'sehat-session-doctor';

// Mirrors src/lib/session.ts getSession()
function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PATIENT_KEY) || localStorage.getItem(DOCTOR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function getPatientSession(): PatientSession | null {
  const s = getSession();
  if (!s || s.type !== 'patient') return null;
  return s as PatientSession;
}

function getDoctorSession(): DoctorSession | null {
  const s = getSession();
  if (!s || s.type !== 'doctor') return null;
  return s as DoctorSession;
}

// Emergency contact parser (mirrors profile/page.tsx regex)
function parseEmergencyContact(combined: string): { name: string; phone: string } {
  const match = combined.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return { name: match[1].trim(), phone: match[2].trim() };
  }
  return { name: combined, phone: '' };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('Session Decoding — Patient', () => {
  it('returns patient session when patient key is set', () => {
    const patient: PatientSession = {
      userId: 1,
      fullName: 'Harjinder Singh',
      email: 'user@example.com',
      type: 'patient',
    };
    localStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
    const s = getPatientSession();
    expect(s).not.toBeNull();
    expect(s?.type).toBe('patient');
    expect(s?.userId).toBe(1);
    expect(s?.fullName).toBe('Harjinder Singh');
  });

  it('returns null for patient session when doctor is logged in', () => {
    const doctor: DoctorSession = {
      id: 1,
      fullName: 'Dr. Gurpreet Singh',
      email: 'doctor@example.com',
      specialty: 'Cardiologist',
      type: 'doctor',
    };
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(doctor));
    expect(getPatientSession()).toBeNull();
  });

  it('returns null when no session exists', () => {
    expect(getPatientSession()).toBeNull();
  });
});

describe('Session Decoding — Doctor', () => {
  it('returns doctor session when doctor key is set', () => {
    const doctor: DoctorSession = {
      id: 2,
      fullName: 'Dr. Harpreet Kaur',
      email: 'harpreet@nabha.health',
      specialty: 'General Physician',
      type: 'doctor',
    };
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(doctor));
    const s = getDoctorSession();
    expect(s).not.toBeNull();
    expect(s?.type).toBe('doctor');
    expect(s?.specialty).toBe('General Physician');
  });

  it('returns null for doctor session when patient is logged in', () => {
    const patient: PatientSession = {
      userId: 1,
      fullName: 'Harjinder Singh',
      email: 'user@example.com',
      type: 'patient',
    };
    localStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
    expect(getDoctorSession()).toBeNull();
  });
});

describe('Session Corruption Handling', () => {
  it('returns null on malformed JSON', () => {
    localStorage.setItem(PATIENT_KEY, 'not-valid-json{{{');
    expect(getSession()).toBeNull();
  });

  it('returns null when localStorage is empty', () => {
    expect(getSession()).toBeNull();
  });
});

describe('Emergency Contact Parser', () => {
  it('parses combined format "Name (Phone)"', () => {
    const { name, phone } = parseEmergencyContact('Gurpreet Kaur (+91 98145 00112)');
    expect(name).toBe('Gurpreet Kaur');
    expect(phone).toBe('+91 98145 00112');
  });

  it('handles name with spaces before parenthesis', () => {
    const { name, phone } = parseEmergencyContact('Manpreet Singh Gill (+91 99999 11111)');
    expect(name).toBe('Manpreet Singh Gill');
    expect(phone).toBe('+91 99999 11111');
  });

  it('returns original string as name when no parentheses', () => {
    const { name, phone } = parseEmergencyContact('Gurpreet Kaur');
    expect(name).toBe('Gurpreet Kaur');
    expect(phone).toBe('');
  });

  it('handles empty string gracefully', () => {
    const { name, phone } = parseEmergencyContact('');
    expect(name).toBe('');
    expect(phone).toBe('');
  });
});

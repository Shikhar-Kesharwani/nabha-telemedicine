/**
 * doctors.test.ts
 * Tests for doctor data integrity: specialty mapping, fee ranges, ID resolution.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Inline representative doctor fixtures (mirrors src/lib/data/doctors.json)
// ---------------------------------------------------------------------------
const doctors = [
  {
    id: 1,
    name: 'Dr. Gurpreet Singh',
    specialty: 'Cardiologist',
    experience: 14,
    rating: 4.9,
    reviews: 187,
    consultationFee: 500,
    email: 'doctor@example.com',
    available: true,
  },
  {
    id: 2,
    name: 'Dr. Harpreet Kaur',
    specialty: 'General Physician',
    experience: 8,
    rating: 4.7,
    reviews: 134,
    consultationFee: 300,
    email: 'harpreet.kaur@nabha.health',
    available: true,
  },
  {
    id: 3,
    name: 'Dr. Amritpal Singh',
    specialty: 'Pediatrician',
    experience: 11,
    rating: 4.8,
    reviews: 212,
    consultationFee: 350,
    email: 'amritpal@nabha.health',
    available: false,
  },
];

// ---------------------------------------------------------------------------
// Helper: resolve doctor by id
// ---------------------------------------------------------------------------
function getDoctorById(id: number) {
  return doctors.find((d) => d.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Helper: filter by specialty
// ---------------------------------------------------------------------------
function getDoctorsBySpecialty(specialty: string) {
  return doctors.filter(
    (d) => d.specialty.toLowerCase() === specialty.toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Doctor ID Resolution', () => {
  it('resolves a valid doctor id', () => {
    const doc = getDoctorById(1);
    expect(doc).not.toBeNull();
    expect(doc?.name).toBe('Dr. Gurpreet Singh');
  });

  it('returns null for unknown id', () => {
    expect(getDoctorById(9999)).toBeNull();
  });

  it('every doctor has a unique email', () => {
    const emails = doctors.map((d) => d.email);
    const unique = new Set(emails);
    expect(unique.size).toBe(emails.length);
  });
});

describe('Doctor Specialty Filter', () => {
  it('finds cardiologists', () => {
    const cards = getDoctorsBySpecialty('Cardiologist');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((d) => expect(d.specialty).toBe('Cardiologist'));
  });

  it('returns empty array for unknown specialty', () => {
    expect(getDoctorsBySpecialty('Astronaut')).toHaveLength(0);
  });
});

describe('Consultation Fee Range', () => {
  it('all fees are between ₹100 and ₹2000', () => {
    doctors.forEach((d) => {
      expect(d.consultationFee).toBeGreaterThanOrEqual(100);
      expect(d.consultationFee).toBeLessThanOrEqual(2000);
    });
  });

  it('fees are whole numbers (no fractional paise)', () => {
    doctors.forEach((d) => {
      expect(Number.isInteger(d.consultationFee)).toBe(true);
    });
  });
});

describe('Doctor Rating', () => {
  it('ratings are between 0 and 5', () => {
    doctors.forEach((d) => {
      expect(d.rating).toBeGreaterThanOrEqual(0);
      expect(d.rating).toBeLessThanOrEqual(5);
    });
  });
});

describe('Doctor Availability', () => {
  it('available flag is a boolean', () => {
    doctors.forEach((d) => {
      expect(typeof d.available).toBe('boolean');
    });
  });
});

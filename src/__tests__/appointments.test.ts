/**
 * appointments.test.ts
 * Tests for slot creation rules, deduplication, and cancellation security.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// In-memory mock appointment store (mirrors DB schema)
// ---------------------------------------------------------------------------
interface Appointment {
  id: number;
  userId: number;
  type: string;
  name: string;
  details: string;
  date: string;
  time: string;
  avatar: string;
  doctorId: string;
}

let store: Appointment[] = [];
let nextId = 1;

function createAppointment(appt: Omit<Appointment, 'id'>): Appointment | null {
  // Deduplication: same user + same doctor + same date+time
  const duplicate = store.find(
    (a) =>
      a.userId === appt.userId &&
      a.doctorId === appt.doctorId &&
      a.date === appt.date &&
      a.time === appt.time
  );
  if (duplicate) return null;
  const newAppt: Appointment = { id: nextId++, ...appt };
  store.push(newAppt);
  return newAppt;
}

function getAppointments(userId: number): Appointment[] {
  return store.filter((a) => a.userId === userId);
}

function cancelAppointment(id: number, userId: number): boolean {
  const idx = store.findIndex((a) => a.id === id && a.userId === userId);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  store = [];
  nextId = 1;
});

describe('Appointment Creation', () => {
  const base: Omit<Appointment, 'id'> = {
    userId: 1,
    type: 'Video Consult',
    name: 'Dr. Gurpreet Singh',
    details: 'Chest pain follow-up',
    date: '2025-09-20',
    time: '10:00 AM',
    avatar: 'avatar.png',
    doctorId: '1',
  };

  it('creates an appointment and returns it', () => {
    const result = createAppointment(base);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.name).toBe('Dr. Gurpreet Singh');
  });

  it('auto-increments appointment ids', () => {
    const a1 = createAppointment(base);
    const a2 = createAppointment({ ...base, time: '11:00 AM' });
    expect(a1?.id).toBe(1);
    expect(a2?.id).toBe(2);
  });
});

describe('Appointment Deduplication', () => {
  it('rejects duplicate appointment (same user, doctor, date, time)', () => {
    const base: Omit<Appointment, 'id'> = {
      userId: 1,
      type: 'Video Consult',
      name: 'Dr. Gurpreet Singh',
      details: '',
      date: '2025-09-20',
      time: '10:00 AM',
      avatar: '',
      doctorId: '1',
    };
    createAppointment(base);
    const dup = createAppointment(base);
    expect(dup).toBeNull();
  });

  it('allows same user with different time slots', () => {
    const base: Omit<Appointment, 'id'> = {
      userId: 1,
      type: 'Video Consult',
      name: 'Dr. Gurpreet Singh',
      details: '',
      date: '2025-09-20',
      time: '10:00 AM',
      avatar: '',
      doctorId: '1',
    };
    createAppointment(base);
    const ok = createAppointment({ ...base, time: '11:00 AM' });
    expect(ok).not.toBeNull();
  });

  it('allows different users for same slot', () => {
    const base: Omit<Appointment, 'id'> = {
      userId: 1,
      type: 'Video Consult',
      name: 'Dr. Gurpreet Singh',
      details: '',
      date: '2025-09-20',
      time: '10:00 AM',
      avatar: '',
      doctorId: '1',
    };
    createAppointment(base);
    const other = createAppointment({ ...base, userId: 2 });
    expect(other).not.toBeNull();
  });
});

describe('Appointment Retrieval', () => {
  it('returns only appointments for the requesting user', () => {
    createAppointment({ userId: 1, type: 'Video', name: 'Doc A', details: '', date: '2025-09-20', time: '10:00 AM', avatar: '', doctorId: '1' });
    createAppointment({ userId: 2, type: 'Video', name: 'Doc B', details: '', date: '2025-09-20', time: '10:00 AM', avatar: '', doctorId: '2' });
    const user1Appts = getAppointments(1);
    expect(user1Appts).toHaveLength(1);
    expect(user1Appts[0].userId).toBe(1);
  });

  it('returns empty array when no appointments exist for user', () => {
    expect(getAppointments(999)).toHaveLength(0);
  });
});

describe('Appointment Cancellation Security', () => {
  it('cancels own appointment successfully', () => {
    const appt = createAppointment({ userId: 1, type: 'Video', name: 'Doc A', details: '', date: '2025-09-20', time: '10:00 AM', avatar: '', doctorId: '1' });
    const result = cancelAppointment(appt!.id, 1);
    expect(result).toBe(true);
    expect(getAppointments(1)).toHaveLength(0);
  });

  it('prevents cancelling another user\'s appointment', () => {
    const appt = createAppointment({ userId: 1, type: 'Video', name: 'Doc A', details: '', date: '2025-09-20', time: '10:00 AM', avatar: '', doctorId: '1' });
    // User 2 tries to cancel user 1's appointment
    const result = cancelAppointment(appt!.id, 2);
    expect(result).toBe(false);
    // Appointment still exists
    expect(getAppointments(1)).toHaveLength(1);
  });

  it('returns false when cancelling non-existent appointment', () => {
    expect(cancelAppointment(9999, 1)).toBe(false);
  });
});

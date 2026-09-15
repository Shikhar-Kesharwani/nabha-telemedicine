'use server';

import db from '@/lib/db';
import type { Appointment as AppointmentType } from '@/types/db';

export type Appointment = AppointmentType;

export async function getAppointments(userId: number): Promise<Appointment[]> {
  try {
    const stmt = db.prepare('SELECT * FROM appointments WHERE userId = ? ORDER BY date ASC');
    const rows = stmt.all(userId) as any[];
    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      type: r.type,
      name: r.name,
      details: r.details,
      date: r.date,
      time: r.time,
      avatar: r.avatar,
      dataAiHint: r.dataAiHint,
      doctorId: r.doctorId,
    }));
  } catch (err) {
    console.error('getAppointments error:', err);
    return [];
  }
}

export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> {
  try {
    const stmt = db.prepare(
      'INSERT INTO appointments (userId, type, name, details, date, time, avatar, dataAiHint, doctorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      appointment.userId,
      appointment.type,
      appointment.name,
      appointment.details || '',
      appointment.date,
      appointment.time,
      appointment.avatar || '',
      appointment.dataAiHint || '',
      appointment.doctorId ? String(appointment.doctorId) : ''
    );
    const newId = Number(result.lastInsertRowid);
    return {
      ...appointment,
      id: newId,
    };
  } catch (err) {
    console.error('createAppointment error:', err);
    return null;
  }
}

export async function cancelAppointment(id: number, userId: number): Promise<boolean> {
  try {
    const stmt = db.prepare('DELETE FROM appointments WHERE id = ? AND userId = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  } catch (err) {
    console.error('cancelAppointment error:', err);
    return false;
  }
}

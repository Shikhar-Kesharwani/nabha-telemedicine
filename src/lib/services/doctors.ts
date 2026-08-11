'use server';

import db from '@/lib/db';
import type { Doctor as DoctorType } from '@/types/db';

export type Doctor = DoctorType;

function mapDoctorRow(row: any): Doctor {
  return {
    id: row.id,
    fullName: row.fullName,
    name: row.fullName,
    specialty: row.specialty,
    experience: row.experience,
    rating: row.rating,
    reviews: row.reviews,
    avatar: row.avatar,
    dataAiHint: row.dataAiHint,
    available: Boolean(row.available),
    consultationFee: row.consultationFee,
    email: row.email,
    password: row.password,
    licenseNumber: row.licenseNumber,
    phone: row.phone,
  } as Doctor;
}

export async function getDoctors(): Promise<Doctor[]> {
  const stmt = db.prepare('SELECT * FROM doctors');
  const rows = stmt.all() as any[];
  return rows.map(r => {
    const { password, ...doctorWithoutPassword } = mapDoctorRow(r);
    return doctorWithoutPassword as Doctor;
  });
}

export async function getDoctorById(id: number | string): Promise<Doctor | null> {
  const stmt = db.prepare('SELECT * FROM doctors WHERE id = ?');
  const row = stmt.get(Number(id)) as any;
  if (!row) return null;
  const { password, ...doctorWithoutPassword } = mapDoctorRow(row);
  return doctorWithoutPassword as Doctor;
}

export async function getDoctorByEmailForAuth(email: string): Promise<Doctor | null> {
  const stmt = db.prepare('SELECT * FROM doctors WHERE email = ?');
  const row = stmt.get(email) as any;
  if (!row) return null;
  return mapDoctorRow(row);
}

export async function createDoctor(newDoctor: Omit<Doctor, 'id' | 'rating' | 'reviews' | 'avatar' | 'available' | 'dataAiHint'> & { avatar?: string; consultationFee?: number }): Promise<Doctor> {
  const stmt = db.prepare(
    'INSERT INTO doctors (fullName, specialty, experience, rating, reviews, avatar, dataAiHint, available, consultationFee, email, password, licenseNumber, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const avatar = newDoctor.avatar || 'https://picsum.photos/seed/doctor-new/200/200';
  const consultationFee = newDoctor.consultationFee || 500;
  const result = stmt.run(
    newDoctor.fullName,
    newDoctor.specialty,
    newDoctor.experience,
    4.9, // Default rating for new doctor
    1, // Default reviews count
    avatar,
    'doctor avatar',
    1, // Available by default
    consultationFee,
    newDoctor.email,
    newDoctor.password || '',
    newDoctor.licenseNumber || '',
    newDoctor.phone || ''
  );
  const newId = Number(result.lastInsertRowid);
  const created = await getDoctorById(newId);
  return created!;
}

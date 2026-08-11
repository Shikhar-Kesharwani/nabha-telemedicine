'use server';

import db from '@/lib/db';
import type { User, Doctor } from '@/types/db';
import bcrypt from 'bcryptjs';

export interface UserSession {
  type: 'patient' | 'doctor';
  userId?: number;
  doctorId?: number;
  email: string;
  fullName: string;
  phone?: string;
  dob?: string;
  gender?: string;
  aadhaar?: string;
  address?: string;
  specialty?: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      aadhaar: user.aadhaar,
      address: user.address,
    };
  } catch (err) {
    return null;
  }
}

export async function createUser(data: Omit<User, 'id'> & { password?: string }): Promise<User> {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : '';
  const stmt = db.prepare(
    'INSERT INTO users (email, fullName, password, phone, dob, gender, aadhaar, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    data.email,
    data.fullName,
    hashedPassword,
    data.phone || '',
    data.dob || '',
    data.gender || 'Female',
    data.aadhaar || '',
    data.address || ''
  );
  const newId = Number(result.lastInsertRowid);
  return {
    id: newId,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    dob: data.dob,
    gender: data.gender,
    aadhaar: data.aadhaar,
    address: data.address,
  };
}

export async function loginPatient(email: string, pass: string): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (!user) {
      // Auto-register demo account if logging in with default credentials
      if (email === 'user@example.com' && pass === 'user123') {
        const demo = {
          id: 1,
          email: 'user@example.com',
          fullName: 'Jane Smith',
          phone: '9876543210',
          dob: '1990-05-15',
          gender: 'Female',
          aadhaar: '123456789012',
          address: 'Model Town, Nabha',
        };
        return { ok: true, user: demo };
      }
      return { ok: false, error: 'Invalid patient email or password' };
    }

    if (user.password && !(await bcrypt.compare(pass, user.password)) && pass !== user.password) {
      return { ok: false, error: 'Invalid patient email or password' };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        aadhaar: user.aadhaar,
        address: user.address,
      },
    };
  } catch (err) {
    console.error('loginPatient error:', err);
    return { ok: false, error: 'Cloud authentication failed' };
  }
}

export async function loginDoctor(email: string, pass: string): Promise<{ ok: boolean; doctor?: Doctor; error?: string }> {
  try {
    const stmt = db.prepare('SELECT * FROM doctors WHERE email = ?');
    const doctor = stmt.get(email) as any;

    if (!doctor) {
      if (email === 'doctor@example.com' && pass === 'doc123') {
        const demoDoc: Doctor = {
          id: 1,
          fullName: 'Dr. Rajesh Sharma',
          name: 'Dr. Rajesh Sharma',
          specialty: 'Cardiologist',
          experience: 15,
          rating: 4.9,
          reviews: 128,
          avatar: 'https://picsum.photos/seed/doctor-1/200/200',
          dataAiHint: 'doctor avatar',
          available: true,
          consultationFee: 500,
          email: 'doctor@example.com',
        };
        return { ok: true, doctor: demoDoc };
      }
      return { ok: false, error: 'Invalid doctor email or password' };
    }

    return {
      ok: true,
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        name: doctor.fullName,
        specialty: doctor.specialty,
        experience: doctor.experience,
        rating: doctor.rating,
        reviews: doctor.reviews,
        avatar: doctor.avatar,
        dataAiHint: doctor.dataAiHint || '',
        available: Boolean(doctor.available),
        consultationFee: doctor.consultationFee,
        email: doctor.email,
      },
    };
  } catch (err) {
    console.error('loginDoctor error:', err);
    return { ok: false, error: 'Doctor authentication failed' };
  }
}

export async function registerPatient(regData: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  gender?: string;
  aadhaar?: string;
  address?: string;
}): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existing = checkStmt.get(regData.email);
    if (existing) {
      return { ok: false, error: 'An account with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(regData.password, 10);
    const insertStmt = db.prepare(
      'INSERT INTO users (email, fullName, password, phone, dob, gender, aadhaar, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = insertStmt.run(
      regData.email,
      regData.fullName,
      hashedPassword,
      regData.phone || '',
      regData.dob || '',
      regData.gender || 'Female',
      regData.aadhaar || '',
      regData.address || ''
    );

    const newId = Number(result.lastInsertRowid);
    return {
      ok: true,
      user: {
        id: newId,
        email: regData.email,
        fullName: regData.fullName,
        phone: regData.phone,
        dob: regData.dob,
        gender: regData.gender,
        aadhaar: regData.aadhaar,
        address: regData.address,
      },
    };
  } catch (err) {
    console.error('registerPatient error:', err);
    return { ok: false, error: 'Failed to create patient account' };
  }
}

export async function updateUserProfile(userId: number, data: Partial<User>): Promise<boolean> {
  try {
    const stmt = db.prepare(
      'UPDATE users SET fullName = COALESCE(?, fullName), phone = COALESCE(?, phone), dob = COALESCE(?, dob), gender = COALESCE(?, gender), address = COALESCE(?, address) WHERE id = ?'
    );
    stmt.run(data.fullName, data.phone, data.dob, data.gender, data.address, userId);
    return true;
  } catch (err) {
    console.error('updateUserProfile error:', err);
    return false;
  }
}

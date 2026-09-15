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
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  sehatCardNo?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
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
      bloodGroup: user.bloodGroup,
      allergies: user.allergies,
      chronicConditions: user.chronicConditions,
      sehatCardNo: user.sehatCardNo,
      emergencyContact: user.emergencyContact,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
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
      if (email === 'user@example.com' && pass === 'user123') {
        const demo: User = {
          id: 1,
          email: 'user@example.com',
          fullName: 'Harjinder Singh',
          phone: '9876543210',
          dob: '1988-08-15',
          gender: 'Male',
          aadhaar: '123456789012',
          address: 'Model Town, Nabha, Punjab',
          bloodGroup: 'O+',
          allergies: 'Penicillin',
          chronicConditions: 'Type 2 Diabetes',
          sehatCardNo: 'PB-SEHAT-99481',
          emergencyContact: 'Gurpreet Kaur (+91 98145 00112)',
        };
        return { ok: true, user: demo };
      }
      return { ok: false, error: 'Invalid patient email or password' };
    }

    let isMatch = false;
    if (user.password) {
      if (user.password === pass) {
        isMatch = true;
      } else {
        try {
          isMatch = await bcrypt.compare(pass, user.password);
        } catch (_) {
          isMatch = false;
        }
      }
    } else {
      isMatch = true;
    }

    if (!isMatch) {
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
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        sehatCardNo: user.sehatCardNo,
        emergencyContact: user.emergencyContact,
      },
    };
  } catch (err) {
    console.error('loginPatient error:', err);
    return { ok: false, error: 'Authentication failed. Please check your credentials.' };
  }
}

export async function loginDoctor(email: string, pass: string): Promise<{ ok: boolean; doctor?: Doctor; error?: string }> {
  try {
    const stmt = db.prepare('SELECT * FROM doctors WHERE email = ?');
    const doctor = stmt.get(email) as any;

    if (!doctor) {
      if ((email === 'doctor@example.com' || email === 'gurpreet.singh@nabhahealth.in') && (pass === 'doc123' || pass === 'doctor123')) {
        const demoDoc: Doctor = {
          id: 1,
          fullName: 'Dr. Gurpreet Singh',
          name: 'Dr. Gurpreet Singh',
          specialty: 'Cardiologist',
          experience: 14,
          rating: 4.9,
          reviews: 187,
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
          dataAiHint: 'doctor portrait',
          available: true,
          consultationFee: 500,
          email: 'doctor@example.com',
        };
        return { ok: true, doctor: demoDoc };
      }
      return { ok: false, error: 'Invalid doctor email or password' };
    }

    let isMatch = false;
    if (doctor.password) {
      if (doctor.password === pass) {
        isMatch = true;
      } else {
        try {
          isMatch = await bcrypt.compare(pass, doctor.password);
        } catch (_) {
          isMatch = false;
        }
      }
    } else {
      isMatch = true;
    }

    if (!isMatch) {
      return { ok: false, error: 'Invalid doctor email or password' };
    }

    return {
      ok: true,
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName || doctor.name,
        name: doctor.fullName || doctor.name,
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
      'UPDATE users SET fullName = COALESCE(?, fullName), phone = COALESCE(?, phone), dob = COALESCE(?, dob), gender = COALESCE(?, gender), address = COALESCE(?, address), bloodGroup = COALESCE(?, bloodGroup), allergies = COALESCE(?, allergies), chronicConditions = COALESCE(?, chronicConditions), sehatCardNo = COALESCE(?, sehatCardNo), emergencyContact = COALESCE(?, emergencyContact), emergencyContactName = COALESCE(?, emergencyContactName), emergencyContactPhone = COALESCE(?, emergencyContactPhone) WHERE id = ?'
    );
    stmt.run(
      data.fullName,
      data.phone,
      data.dob,
      data.gender,
      data.address,
      (data as any).bloodGroup,
      (data as any).allergies,
      (data as any).chronicConditions,
      (data as any).sehatCardNo,
      (data as any).emergencyContact,
      (data as any).emergencyContactName,
      (data as any).emergencyContactPhone,
      userId
    );
    return true;
  } catch (err) {
    console.error('updateUserProfile error:', err);
    return false;
  }
}

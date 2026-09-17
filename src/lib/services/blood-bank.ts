'use server';

import db from '@/lib/db';

export interface BloodRequest {
  id: number;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  urgency: 'CRITICAL' | 'URGENT' | 'MODERATE';
  contactPerson: string;
  contactPhone: string;
  status: string;
  notes?: string;
  createdAt: string;
  expiresAt: string;
}

export interface BloodDonor {
  id: number;
  name: string;
  bloodGroup: string;
  phone: string;
  location: string;
  lastDonated?: string;
  isAvailable: boolean;
}

// Medical compatibility map: Who can donate to this recipient?
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

export async function getBloodRequests(): Promise<BloodRequest[]> {
  try {
    const stmt = db.prepare(`
      SELECT * FROM blood_requests 
      WHERE status = 'ACTIVE' 
      ORDER BY 
        CASE urgency 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'URGENT' THEN 2 
          ELSE 3 
        END, 
        id DESC
    `);
    const rows = stmt.all() as BloodRequest[];
    return rows;
  } catch (error) {
    console.error('Failed to get blood requests:', error);
    return [];
  }
}

export async function createBloodRequest(data: {
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  urgency: 'CRITICAL' | 'URGENT' | 'MODERATE';
  contactPerson: string;
  contactPhone: string;
  notes?: string;
}): Promise<BloodRequest | null> {
  try {
    const now = new Date();
    // 24 hours expiry for emergency request
    const expires = new Date(Date.now() + 24 * 3600000);

    const stmt = db.prepare(`
      INSERT INTO blood_requests 
      (patientName, bloodGroup, unitsNeeded, hospital, urgency, contactPerson, contactPhone, status, notes, createdAt, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
    `);

    const info = stmt.run(
      data.patientName,
      data.bloodGroup,
      data.unitsNeeded || 1,
      data.hospital,
      data.urgency,
      data.contactPerson,
      data.contactPhone,
      data.notes || '',
      now.toISOString(),
      expires.toISOString()
    );

    return {
      id: Number(info.lastInsertRowid),
      patientName: data.patientName,
      bloodGroup: data.bloodGroup,
      unitsNeeded: data.unitsNeeded || 1,
      hospital: data.hospital,
      urgency: data.urgency,
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      status: 'ACTIVE',
      notes: data.notes || '',
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
  } catch (error) {
    console.error('Failed to create blood request:', error);
    return null;
  }
}

export async function getBloodDonors(filterBloodGroup?: string): Promise<BloodDonor[]> {
  try {
    let rows: any[] = [];
    if (filterBloodGroup && filterBloodGroup !== 'ALL') {
      const compatibleGroups = COMPATIBLE_DONORS_FOR_RECIPIENT[filterBloodGroup] || [filterBloodGroup];
      const placeholders = compatibleGroups.map(() => '?').join(',');
      const stmt = db.prepare(`
        SELECT * FROM blood_donors 
        WHERE bloodGroup IN (${placeholders}) AND isAvailable = 1
        ORDER BY id ASC
      `);
      rows = stmt.all(...compatibleGroups);
    } else {
      const stmt = db.prepare(`SELECT * FROM blood_donors WHERE isAvailable = 1 ORDER BY id ASC`);
      rows = stmt.all();
    }

    return rows.map((r) => ({
      ...r,
      isAvailable: Boolean(r.isAvailable),
    }));
  } catch (error) {
    console.error('Failed to get blood donors:', error);
    return [];
  }
}

export async function registerBloodDonor(data: {
  name: string;
  bloodGroup: string;
  phone: string;
  location: string;
}): Promise<boolean> {
  try {
    const stmt = db.prepare(`
      INSERT INTO blood_donors (name, bloodGroup, phone, location, lastDonated, isAvailable)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    stmt.run(data.name, data.bloodGroup, data.phone, data.location, new Date().toISOString().split('T')[0]);
    return true;
  } catch (error) {
    console.error('Failed to register donor:', error);
    return false;
  }
}

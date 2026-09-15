'use server';

import db from '@/lib/db';

export interface VitalsData {
  id?: number;
  userId: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spO2: number;
  bloodGlucose: number;
  recordedAt?: string;
}

export async function getLatestVitals(userId: number): Promise<VitalsData | null> {
  try {
    const stmt = db.prepare(
      'SELECT * FROM vitals WHERE userId = ? ORDER BY id DESC LIMIT 1'
    );
    const row = stmt.get(userId) as any;
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      heartRate: row.heartRate,
      systolic: row.systolic,
      diastolic: row.diastolic,
      spO2: row.spO2,
      bloodGlucose: row.bloodGlucose,
      recordedAt: row.recordedAt,
    };
  } catch (err) {
    console.error('getLatestVitals error:', err);
    return null;
  }
}

export async function recordVitals(vitals: VitalsData): Promise<boolean> {
  try {
    const recordedAt = vitals.recordedAt || new Date().toISOString();
    const stmt = db.prepare(
      'INSERT INTO vitals (userId, heartRate, systolic, diastolic, spO2, bloodGlucose, recordedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(
      vitals.userId,
      vitals.heartRate,
      vitals.systolic,
      vitals.diastolic,
      vitals.spO2,
      vitals.bloodGlucose,
      recordedAt
    );
    return true;
  } catch (err) {
    console.error('recordVitals error:', err);
    return false;
  }
}

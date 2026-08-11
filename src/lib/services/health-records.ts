'use server';

import db from '@/lib/db';

export interface HealthRecord {
  id: number;
  userId: number;
  name: string;
  type: string;
  date: string;
  doctor: string;
  content?: string;
}

export async function getHealthRecordsForUser(userId: number): Promise<HealthRecord[]> {
  const stmt = db.prepare('SELECT * FROM health_records WHERE userId = ? ORDER BY date DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map(r => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    type: r.type,
    date: r.date,
    doctor: r.doctor,
    content: r.content,
  }));
}

export async function createHealthRecord(record: Omit<HealthRecord, 'id'>): Promise<HealthRecord> {
  const stmt = db.prepare(
    'INSERT INTO health_records (userId, name, type, date, doctor, content) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    record.userId,
    record.name,
    record.type,
    record.date,
    record.doctor,
    record.content || ''
  );
  const newId = Number(result.lastInsertRowid);
  return {
    ...record,
    id: newId,
  };
}

export async function getSampleReportContent(recordId: number): Promise<string | null> {
  const stmt = db.prepare('SELECT * FROM health_records WHERE id = ?');
  const record = stmt.get(recordId) as any;
  if (!record) return null;

  if (record.content) {
    return record.content;
  }

  return `--- ${record.name.toUpperCase()} ---
Date: ${record.date}
Patient ID: ${record.userId}
Attending Physician: ${record.doctor}
Location: Nabha Telemedicine Clinic, Nabha, Punjab

SUMMARY / OBSERVATIONS:
- Patient presented for routine evaluation.
- All vital signs within normal parameters.
- Comprehensive evaluation performed.

RECOMMENDATIONS:
1. Follow prescribed medication schedule carefully.
2. Ensure adequate daily hydration and rest.
3. Return for follow-up evaluation in 4 weeks or if symptoms return.

Issued by Nabha Telemedicine Services (Sehat)
`;
}

// Alias: getHealthRecords(userId) — used by health-records page
export const getHealthRecords = getHealthRecordsForUser;

'use server';

import db from '@/lib/db';

export interface AmbulanceDispatch {
  id?: number;
  userEmail: string;
  ambulanceType: string;
  driverName: string;
  vehicleNo: string;
  etaMinutes: number;
  status: string;
  location: string;
  timestamp?: string;
}

export async function createAmbulanceDispatch(dispatch: Omit<AmbulanceDispatch, 'id' | 'timestamp'>): Promise<AmbulanceDispatch> {
  const timestamp = new Date().toISOString();
  const stmt = db.prepare(
    'INSERT INTO ambulance_dispatches (userEmail, ambulanceType, driverName, vehicleNo, etaMinutes, status, location, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    dispatch.userEmail,
    dispatch.ambulanceType,
    dispatch.driverName,
    dispatch.vehicleNo,
    dispatch.etaMinutes,
    dispatch.status,
    dispatch.location,
    timestamp
  );
  const newId = Number(result.lastInsertRowid);
  return {
    ...dispatch,
    id: newId,
    timestamp,
  };
}

export async function getDispatchesForUser(userEmail: string): Promise<AmbulanceDispatch[]> {
  const stmt = db.prepare('SELECT * FROM ambulance_dispatches WHERE userEmail = ? ORDER BY timestamp DESC');
  const rows = stmt.all(userEmail) as any[];
  return rows.map(r => ({
    id: r.id,
    userEmail: r.userEmail,
    ambulanceType: r.ambulanceType,
    driverName: r.driverName,
    vehicleNo: r.vehicleNo,
    etaMinutes: r.etaMinutes,
    status: r.status,
    location: r.location,
    timestamp: r.timestamp,
  }));
}

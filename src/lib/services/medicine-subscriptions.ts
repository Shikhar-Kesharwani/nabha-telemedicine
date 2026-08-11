'use server';

import db from '@/lib/db';

export interface MedicineSubscription {
  id: number;
  userEmail: string;
  medicineName: string;
  pharmacyName: string;
  timestamp: string;
}

export interface StockNotification {
  id: number;
  user_email: string;
  medicine_name: string;
  pharmacy_name: string;
  timestamp?: string;
}

export async function getSubscriptionsForUser(userEmail: string): Promise<MedicineSubscription[]> {
  const stmt = db.prepare('SELECT * FROM medicine_subscriptions WHERE user_email = ?');
  const rows = stmt.all(userEmail) as any[];
  return rows.map(r => ({
    id: r.id,
    userEmail: r.user_email,
    medicineName: r.medicine_name,
    pharmacyName: r.pharmacy_name,
    timestamp: r.timestamp,
  }));
}

export async function getActiveSubscriptions(): Promise<StockNotification[]> {
  const stmt = db.prepare('SELECT * FROM medicine_subscriptions ORDER BY timestamp DESC');
  const rows = stmt.all() as any[];
  return rows.map(r => ({
    id: r.id,
    user_email: r.user_email,
    medicine_name: r.medicine_name,
    pharmacy_name: r.pharmacy_name,
    timestamp: r.timestamp,
  }));
}

export async function dismissNotification(notificationId: number): Promise<void> {
  const stmt = db.prepare('DELETE FROM medicine_subscriptions WHERE id = ?');
  stmt.run(notificationId);
}

export async function addSubscription(
  userEmail: string,
  medicineName: string,
  pharmacyName: string
): Promise<{ success: boolean; subscription?: MedicineSubscription }> {
  const checkStmt = db.prepare(
    'SELECT * FROM medicine_subscriptions WHERE user_email = ? AND medicine_name = ? AND pharmacy_name = ?'
  );
  const existing = checkStmt.get(userEmail, medicineName, pharmacyName);
  if (existing) {
    return { success: false };
  }

  const timestamp = new Date().toISOString();
  const insertStmt = db.prepare(
    'INSERT INTO medicine_subscriptions (user_email, medicine_name, pharmacy_name, timestamp) VALUES (?, ?, ?, ?)'
  );
  const result = insertStmt.run(userEmail, medicineName, pharmacyName, timestamp);
  const newId = Number(result.lastInsertRowid);

  return {
    success: true,
    subscription: {
      id: newId,
      userEmail,
      medicineName,
      pharmacyName,
      timestamp,
    },
  };
}

// Alias used by medicine-finder page — toggle (add if not exists, remove if exists)
export async function toggleSubscription(
  userEmail: string,
  medicineName: string,
  pharmacyName: string
): Promise<void> {
  const existing = db.prepare(
    'SELECT * FROM medicine_subscriptions WHERE user_email = ? AND medicine_name = ?'
  ).get(userEmail, medicineName);

  if (existing) {
    db.prepare('DELETE FROM medicine_subscriptions WHERE user_email = ? AND medicine_name = ?')
      .run(userEmail, medicineName);
  } else {
    await addSubscription(userEmail, medicineName, pharmacyName);
  }
}

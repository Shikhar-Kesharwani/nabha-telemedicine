// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'sehat.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    fullName TEXT NOT NULL,
    password TEXT,
    phone TEXT,
    dob TEXT,
    gender TEXT,
    aadhaar TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience INTEGER NOT NULL,
    rating REAL NOT NULL,
    reviews INTEGER NOT NULL,
    avatar TEXT NOT NULL,
    dataAiHint TEXT,
    available INTEGER NOT NULL DEFAULT 1,
    consultationFee INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    licenseNumber TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    details TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    avatar TEXT NOT NULL,
    dataAiHint TEXT,
    doctorId TEXT
  );

  CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    doctor TEXT NOT NULL,
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    text TEXT NOT NULL,
    sender TEXT NOT NULL,
    avatar TEXT NOT NULL,
    attachment_name TEXT,
    attachment_url TEXT,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medicine_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    pharmacy_name TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pharmacies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    is24x7 INTEGER NOT NULL DEFAULT 1,
    isOpen INTEGER NOT NULL DEFAULT 1,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brandName TEXT NOT NULL,
    chemicalName TEXT NOT NULL,
    category TEXT NOT NULL,
    priceRupees INTEGER NOT NULL,
    inStock INTEGER NOT NULL DEFAULT 1,
    pharmacyName TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ambulance_dispatches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userEmail TEXT NOT NULL,
    ambulanceType TEXT NOT NULL,
    driverName TEXT NOT NULL,
    vehicleNo TEXT NOT NULL,
    etaMinutes INTEGER NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
`);

// Seed initial data from JSON files if tables are empty
function seedIfEmpty() {
  try {
    // Seed Users
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      const usersFile = path.join(process.cwd(), 'src/lib/data/users.json');
      if (fs.existsSync(usersFile)) {
        const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
        const insertUser = db.prepare(
          'INSERT INTO users (id, email, fullName, password, phone, dob, gender, aadhaar, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const u of data.users || []) {
          insertUser.run(u.id, u.email, u.fullName, u.password || '', u.phone || '', u.dob || '', u.gender || '', u.aadhaar || '', u.address || '');
        }
      }
    }

    // Ensure Demo Patient User exists
    const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('user@example.com');
    if (!demoUser) {
      db.prepare(
        'INSERT INTO users (email, fullName, password, phone, dob, gender, aadhaar, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run('user@example.com', 'Jane Smith', 'user123', '9876543210', '1990-05-15', 'Female', '123456789012', 'Model Town, Nabha');
    }

    // Ensure Demo Doctor User exists
    const demoDoctor = db.prepare('SELECT id FROM doctors WHERE email = ?').get('doctor@example.com');
    if (!demoDoctor) {
      db.prepare(
        'INSERT INTO doctors (fullName, specialty, experience, rating, reviews, avatar, dataAiHint, available, consultationFee, email, password, licenseNumber, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run('Dr. Rajesh Sharma', 'Cardiologist', 15, 4.9, 128, 'https://picsum.photos/seed/doctor-1/200/200', 'doctor avatar', 1, 500, 'doctor@example.com', 'doc123', 'PB-98765', '9811122233');
    }

    // Seed Doctors
    const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number };
    if (doctorCount.count === 0) {
      const doctorsFile = path.join(process.cwd(), 'src/lib/data/doctors.json');
      if (fs.existsSync(doctorsFile)) {
        const data = JSON.parse(fs.readFileSync(doctorsFile, 'utf-8'));
        const insertDoctor = db.prepare(
          'INSERT INTO doctors (id, fullName, specialty, experience, rating, reviews, avatar, dataAiHint, available, consultationFee, email, password, licenseNumber, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const d of data) {
          insertDoctor.run(
            d.id,
            d.name || d.fullName,
            d.specialty,
            d.experience,
            d.rating,
            d.reviews,
            d.avatar,
            d.dataAiHint || '',
            d.available ? 1 : 0,
            d.consultationFee,
            d.email,
            d.password || '',
            d.licenseNumber || '',
            d.phone || ''
          );
        }
      }
    }

    // Seed Appointments
    const apptCount = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number };
    if (apptCount.count === 0) {
      const apptsFile = path.join(process.cwd(), 'src/lib/data/appointments.json');
      if (fs.existsSync(apptsFile)) {
        const data = JSON.parse(fs.readFileSync(apptsFile, 'utf-8'));
        const insertAppt = db.prepare(
          'INSERT INTO appointments (id, userId, type, name, details, date, time, avatar, dataAiHint, doctorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const a of data.appointments || []) {
          insertAppt.run(
            a.id,
            a.userId,
            a.type,
            a.name,
            a.details || '',
            a.date,
            a.time,
            a.avatar || '',
            a.dataAiHint || '',
            a.doctorId ? String(a.doctorId) : ''
          );
        }
      }
    }

    // Seed Health Records
    const hrCount = db.prepare('SELECT COUNT(*) as count FROM health_records').get() as { count: number };
    if (hrCount.count === 0) {
      const hrFile = path.join(process.cwd(), 'src/lib/data/health-records.json');
      if (fs.existsSync(hrFile)) {
        const data = JSON.parse(fs.readFileSync(hrFile, 'utf-8'));
        const recordsList = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray(data.records) ? data.records : []);
        const insertHr = db.prepare(
          'INSERT INTO health_records (id, userId, name, type, date, doctor, content) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        for (const r of recordsList) {
          insertHr.run(r.id, r.userId, r.name, r.type, r.date, r.doctor, r.content || '');
        }
      }
    }

    // Seed Chat Messages
    const chatCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get() as { count: number };
    if (chatCount.count === 0) {
      const chatFile = path.join(process.cwd(), 'src/lib/data/chat-messages.json');
      if (fs.existsSync(chatFile)) {
        const data = JSON.parse(fs.readFileSync(chatFile, 'utf-8'));
        const insertChat = db.prepare(
          'INSERT INTO chat_messages (id, user_email, doctor_id, text, sender, avatar, attachment_name, attachment_url, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const m of data.messages || []) {
          insertChat.run(
            m.id,
            m.user_email,
            m.doctor_id,
            m.text,
            m.sender,
            m.avatar,
            m.attachment?.name || null,
            m.attachment?.url || null,
            m.timestamp || new Date().toISOString()
          );
        }
      }
    }

    // Seed Pharmacies
    const pharmCount = db.prepare('SELECT COUNT(*) as count FROM pharmacies').get() as { count: number };
    if (pharmCount.count === 0) {
      const insertPharm = db.prepare(
        'INSERT INTO pharmacies (name, address, phone, is24x7, isOpen, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      const initialPharms = [
        { name: "Jan Aushadhi Kendra — Central Nabha", address: "Main Market Rd, Near Civil Hospital, Nabha, Punjab 147201", phone: "+91 98145 12345", is24x7: 1, isOpen: 1, lat: 30.3753, lng: 76.1524 },
        { name: "Sanjivani Chemist & Druggists", address: "Patiala Gate, Circular Road, Nabha, Punjab 147201", phone: "+91 98720 54321", is24x7: 1, isOpen: 1, lat: 30.3721, lng: 76.1558 },
        { name: "Apex MediCare Pharmacy", address: "Opp. Bus Stand, Nabha, Punjab 147201", phone: "+91 94171 99887", is24x7: 0, isOpen: 1, lat: 30.3789, lng: 76.1492 },
        { name: "Jan Aushadhi Kendra — Model Town", address: "Shop 12, Model Town Market, Nabha, Punjab 147201", phone: "+91 98150 77665", is24x7: 1, isOpen: 1, lat: 30.3812, lng: 76.1576 },
        { name: "LifeLine Chemists & Surgicals", address: "Duladdi Gate, Nabha, Punjab 147201", phone: "+91 98555 44332", is24x7: 0, isOpen: 0, lat: 30.3695, lng: 76.1480 },
      ];
      for (const p of initialPharms) {
        insertPharm.run(p.name, p.address, p.phone, p.is24x7, p.isOpen, p.lat, p.lng);
      }
    }

    // Seed Medicines
    const medCount = db.prepare('SELECT COUNT(*) as count FROM medicines').get() as { count: number };
    if (medCount.count === 0) {
      const insertMed = db.prepare(
        'INSERT INTO medicines (brandName, chemicalName, category, priceRupees, inStock, pharmacyName) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const initialMeds = [
        { brandName: "Paracetamol 500mg", chemicalName: "Acetaminophen", category: "Analgesic", priceRupees: 12, inStock: 1, pharmacyName: "Jan Aushadhi Kendra — Central Nabha" },
        { brandName: "Metformin 500mg", chemicalName: "Metformin Hydrochloride", category: "Anti-Diabetic", priceRupees: 18, inStock: 1, pharmacyName: "Jan Aushadhi Kendra — Central Nabha" },
        { brandName: "Amoxicillin 500mg", chemicalName: "Amoxicillin Trihydrate", category: "Antibiotic", priceRupees: 35, inStock: 0, pharmacyName: "Sanjivani Chemist & Druggists" },
        { brandName: "Atorvastatin 10mg", chemicalName: "Atorvastatin Calcium", category: "Cardiovascular", priceRupees: 28, inStock: 1, pharmacyName: "Jan Aushadhi Kendra — Central Nabha" },
        { brandName: "Azithromycin 500mg", chemicalName: "Azithromycin Dihydrate", category: "Antibiotic", priceRupees: 45, inStock: 0, pharmacyName: "Apex MediCare Pharmacy" },
        { brandName: "Pantoprazole 40mg", chemicalName: "Pantoprazole Sodium", category: "Gastrointestinal", priceRupees: 22, inStock: 1, pharmacyName: "Jan Aushadhi Kendra — Model Town" },
        { brandName: "Cetirizine 10mg", chemicalName: "Cetirizine Hydrochloride", category: "Anti-Allergic", priceRupees: 10, inStock: 1, pharmacyName: "Jan Aushadhi Kendra — Central Nabha" },
        { brandName: "Amlodipine 5mg", chemicalName: "Amlodipine Besylate", category: "Cardiovascular", priceRupees: 15, inStock: 1, pharmacyName: "Sanjivani Chemist & Druggists" },
      ];
      for (const m of initialMeds) {
        insertMed.run(m.brandName, m.chemicalName, m.category, m.priceRupees, m.inStock, m.pharmacyName);
      }
    }
  } catch (err) {
    console.error('Error seeding SQLite database:', err);
  }
}

seedIfEmpty();

export default db;

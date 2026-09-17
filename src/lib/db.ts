// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

/**
 * Vercel serverless functions run on a read-only filesystem at the project root.
 * When VERCEL=1 is set (injected automatically by Vercel), we use /tmp which
 * is writable but ephemeral — the DB is re-seeded from JSON on each cold start.
 * In local dev and other environments, the DB lives at project root as usual.
 */
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel
  ? '/tmp/sehat.db'
  : path.join(process.cwd(), 'sehat.db');

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
    address TEXT,
    bloodGroup TEXT,
    allergies TEXT,
    chronicConditions TEXT,
    sehatCardNo TEXT,
    emergencyContact TEXT
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
    phone TEXT,
    hospital TEXT,
    location TEXT
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
  CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    heartRate INTEGER NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    spO2 INTEGER NOT NULL,
    bloodGlucose INTEGER NOT NULL,
    recordedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS symptom_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    symptomQuery TEXT NOT NULL,
    predictedCondition TEXT NOT NULL,
    icdCode TEXT NOT NULL,
    urgency TEXT NOT NULL,
    specialist TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Nabha',
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    unitsNeeded INTEGER NOT NULL DEFAULT 1,
    hospital TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Urgent',
    contactPerson TEXT NOT NULL,
    contactPhone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blood_donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    lastDonated TEXT,
    isAvailable INTEGER NOT NULL DEFAULT 1
  );
`);

// Migration: Add medical profile & doctor location columns if they don't exist
const medicalCols = ['bloodGroup', 'allergies', 'chronicConditions', 'sehatCardNo', 'emergencyContact', 'emergencyContactName', 'emergencyContactPhone'];
for (const col of medicalCols) {
  try { db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`); } catch (_) { /* column already exists */ }
}

const doctorCols = ['hospital', 'location'];
for (const col of doctorCols) {
  try { db.exec(`ALTER TABLE doctors ADD COLUMN ${col} TEXT`); } catch (_) { /* column already exists */ }
}

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
        'INSERT INTO users (email, fullName, password, phone, dob, gender, aadhaar, address, bloodGroup, allergies, chronicConditions, sehatCardNo, emergencyContact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run('user@example.com', 'Harjinder Singh', 'user123', '9876543210', '1988-08-15', 'Male', '123456789012', 'Model Town, Nabha, Punjab', 'O+', 'Penicillin', 'Type 2 Diabetes', 'PB-SEHAT-99481', 'Gurpreet Kaur (+91 98145 00112)');
    }

    // Ensure Demo Doctor User exists
    const demoDoctor = db.prepare('SELECT id FROM doctors WHERE email = ?').get('doctor@example.com');
    if (!demoDoctor) {
      db.prepare(
        'INSERT INTO doctors (fullName, specialty, experience, rating, reviews, avatar, dataAiHint, available, consultationFee, email, password, licenseNumber, phone, hospital, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run('Dr. Gurpreet Singh', 'Cardiologist', 14, 4.9, 187, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop', 'doctor portrait', 1, 500, 'doctor@example.com', 'doc123', 'PB-MCI-12345', '9814511201', 'Rajindra Hospital, Patiala', 'Patiala, Punjab');
    }

    // Seed Doctors
    const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number };
    if (doctorCount.count === 0) {
      const doctorsFile = path.join(process.cwd(), 'src/lib/data/doctors.json');
      if (fs.existsSync(doctorsFile)) {
        const data = JSON.parse(fs.readFileSync(doctorsFile, 'utf-8'));
        const insertDoctor = db.prepare(
          'INSERT INTO doctors (id, fullName, specialty, experience, rating, reviews, avatar, dataAiHint, available, consultationFee, email, password, licenseNumber, phone, hospital, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
            d.phone || '',
            d.hospital || '',
            d.location || ''
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
        let recordsList: any[] = [];
        if (Array.isArray(data)) {
          recordsList = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.records)) {
            recordsList = data.records;
          } else if (data.records && typeof data.records === 'object') {
            recordsList = Object.values(data.records).flat();
          }
        }
        const insertHr = db.prepare(
          'INSERT INTO health_records (id, userId, name, type, date, doctor, content) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        for (const r of recordsList) {
          insertHr.run(r.id, r.userId || 1, r.name, r.type, r.date, r.doctor, r.content || data.sampleReportContents?.[r.id] || '');
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

    // Seed Symptom Logs (Epidemiological surveillance baseline)
    const logCount = db.prepare('SELECT COUNT(*) as count FROM symptom_logs').get() as { count: number };
    if (logCount.count === 0) {
      const insertLog = db.prepare(
        'INSERT INTO symptom_logs (symptomQuery, predictedCondition, icdCode, urgency, specialist, location, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      const now = Date.now();
      const oneDay = 86400000;
      const initialLogs = [
        { q: "high fever and breakbone joint pain", c: "Dengue Hemorrhagic Fever", icd: "A90", u: "Immediate Medical Attention", s: "General Physician", loc: "Patiala Gate, Nabha", ts: new Date(now - oneDay * 0.5).toISOString() },
        { q: "fever with severe eye pain and rash", c: "Dengue Hemorrhagic Fever", icd: "A90", u: "Immediate Medical Attention", s: "General Physician", loc: "Model Town, Nabha", ts: new Date(now - oneDay * 1.2).toISOString() },
        { q: "stepwise high fever and stomach pain", c: "Typhoid Fever (Salmonella Typhi)", icd: "A01.0", u: "Consultation Recommended", s: "General Physician", loc: "Bhadson Road, Nabha", ts: new Date(now - oneDay * 1.8).toISOString() },
        { q: "loose motions and dehydration vomiting", c: "Acute Gastroenteritis / Waterborne Diarrhea", icd: "A09", u: "Consultation Recommended", s: "General Physician", loc: "Circular Road, Nabha", ts: new Date(now - oneDay * 2.1).toISOString() },
        { q: "severe joint pain and dengue suspicion", c: "Dengue Hemorrhagic Fever", icd: "A90", u: "Immediate Medical Attention", s: "General Physician", loc: "Civil Hospital Area, Nabha", ts: new Date(now - oneDay * 2.8).toISOString() },
        { q: "heavy smoke inhalation and breathlessness", c: "COPD Exacerbation / Stubble Smoke Bronchospasm", icd: "J44.1", u: "Consultation Recommended", s: "Pulmonologist", loc: "Duladdi Gate, Nabha", ts: new Date(now - oneDay * 3.5).toISOString() },
        { q: "fever chills rigors sweating", c: "Malaria (Plasmodium Falciparum/Vivax)", icd: "B50.9", u: "Consultation Recommended", s: "General Physician", loc: "Alhoran Gate, Nabha", ts: new Date(now - oneDay * 4.0).toISOString() },
        { q: "breakbone fever platelet low", c: "Dengue Hemorrhagic Fever", icd: "A90", u: "Immediate Medical Attention", s: "General Physician", loc: "Mehs Gate, Nabha", ts: new Date(now - oneDay * 4.5).toISOString() },
      ];
      for (const l of initialLogs) {
        insertLog.run(l.q, l.c, l.icd, l.u, l.s, l.loc, l.ts);
      }
    }

    // Seed Blood Requests
    const reqCount = db.prepare('SELECT COUNT(*) as count FROM blood_requests').get() as { count: number };
    if (reqCount.count === 0) {
      const insertReq = db.prepare(
        'INSERT INTO blood_requests (patientName, bloodGroup, unitsNeeded, hospital, urgency, contactPerson, contactPhone, status, notes, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const now = new Date();
      const exp1 = new Date(Date.now() + 18 * 3600000).toISOString();
      const exp2 = new Date(Date.now() + 36 * 3600000).toISOString();
      insertReq.run("Kuldeep Singh (Age 48)", "O+", 2, "Civil Hospital Nabha (Emergency Ward)", "CRITICAL", "Paramjit Kaur", "+91 98145 33221", "ACTIVE", "Required for emergency surgical repair post-road accident on Nabha-Patiala road.", now.toISOString(), exp1);
      insertReq.run("Smt. Harbhajan Kaur (Age 64)", "B+", 1, "Rajindra Hospital, Patiala (ICU)", "URGENT", "Jaspreet Singh", "+91 98720 11994", "ACTIVE", "Severe thrombocytopenia / Dengue complication. Platelets + PRBC required.", now.toISOString(), exp2);
      insertReq.run("Navjot Singh (Age 29)", "AB-", 1, "Vardaan Multispeciality Hospital, Nabha", "MODERATE", "Sandeep Sharma", "+91 94171 44556", "ACTIVE", "Scheduled orthopedic fracture fixation surgery tomorrow morning.", now.toISOString(), exp2);
    }

    // Seed Blood Donors Registry
    const donorCount = db.prepare('SELECT COUNT(*) as count FROM blood_donors').get() as { count: number };
    if (donorCount.count === 0) {
      const insertDonor = db.prepare(
        'INSERT INTO blood_donors (name, bloodGroup, phone, location, lastDonated, isAvailable) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const donors = [
        { name: "Manpreet Singh Dhillon", bg: "O+", phone: "+91 98145 00981", loc: "Model Town, Nabha", ld: "2024-05-10", a: 1 },
        { name: "Sukhdev Singh Gill", bg: "O-", phone: "+91 98765 44321", loc: "Patiala Gate, Nabha", ld: "2024-04-12", a: 1 },
        { name: "Amanjot Kaur", bg: "A+", phone: "+91 94171 88776", loc: "Near Ripudaman College, Nabha", ld: "2024-06-01", a: 1 },
        { name: "Gurwinder Singh Brar", bg: "B+", phone: "+91 98555 22110", loc: "Bhadson, Nabha Rural", ld: "2024-03-20", a: 1 },
        { name: "Dr. Sandeep Kaushal", bg: "AB+", phone: "+91 98150 33445", loc: "Civil Hospital Quarters, Nabha", ld: "2024-05-25", a: 1 },
        { name: "Ravinder Singh Chahal", bg: "B-", phone: "+91 98721 66554", loc: "Circular Road, Nabha", ld: "2024-02-14", a: 1 },
        { name: "Harpreet Singh Sidhu", bg: "A-", phone: "+91 94172 99001", loc: "Duladdi, Nabha", ld: "2024-06-15", a: 1 },
        { name: "Jaswinder Singh Cheema", bg: "AB-", phone: "+91 98146 77889", loc: "Alhoran, Nabha", ld: "2024-01-10", a: 1 },
      ];
      for (const d of donors) {
        insertDonor.run(d.name, d.bg, d.phone, d.loc, d.ld, d.a);
      }
    }
  } catch (err) {
    console.error('Error seeding SQLite database:', err);
  }
}

seedIfEmpty();

export default db;

export interface SessionUser {
  type: 'patient' | 'doctor';
  userId?: number;
  id?: number;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  aadhaar?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  sehatCardNo?: string;
  emergencyContact?: string;
  specialty?: string;
  hospital?: string;
  [key: string]: any;
}

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const patientSession = localStorage.getItem('sehat-session-patient');
    if (patientSession) {
      const parsed = JSON.parse(patientSession);
      return { type: 'patient', ...parsed };
    }
    const doctorSession = localStorage.getItem('sehat-session-doctor');
    if (doctorSession) {
      const parsed = JSON.parse(doctorSession);
      return { type: 'doctor', ...parsed };
    }
  } catch (err) {
    console.error('Failed to parse session:', err);
  }
  return null;
}

export function getPatientSession(): SessionUser | null {
  const session = getSession();
  return session?.type === 'patient' ? session : null;
}

export function getDoctorSession(): SessionUser | null {
  const session = getSession();
  return session?.type === 'doctor' ? session : null;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sehat-session-patient');
  localStorage.removeItem('sehat-session-doctor');
}

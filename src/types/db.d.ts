
export interface User {
  id: number;
  email: string;
  fullName: string;
  password?: string; // Should not be sent to client
  phone?: string;
  dob?: string;
  gender?: string;
  aadhaar?: string;
  address?: string;
}

export interface Doctor {
    id: number;
    fullName: string;
    name?: string;
    specialty: string;
    experience: number;
    rating: number;
    reviews: number;
    avatar: string;
    dataAiHint: string;
    available: boolean;
    consultationFee: number;
    email: string;
    password?: string; // Should not be sent to client
    licenseNumber?: string;
    phone?: string;
}

export interface Appointment {
  id: number;
  userId: number;
  type: 'Doctor' | 'Lab Test';
  name: string;
  details?: string;
  date: string;
  time: string;
  avatar: string;
  dataAiHint: string;
  doctorId?: number | string;
}

export interface Message {
  id: string;
  user_email: string;
  doctor_id: string;
  text: string;
  sender: 'user' | 'doctor';
  avatar: string;
  attachment?: {
    name: string;
    url: string;
  };
  timestamp?: string;
}

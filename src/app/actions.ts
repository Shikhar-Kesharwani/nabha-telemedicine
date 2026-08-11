'use server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/services/user';
import { getDoctorByEmailForAuth, createDoctor } from '@/lib/services/doctors';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

const PatientSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z.string().min(10, "Please enter a valid mobile number."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const DoctorSignupSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Valid phone number is required."),
  specialty: z.string().min(1, "Specialty is required."),
  licenseNumber: z.string().min(1, "License number is required."),
  experience: z.coerce.number().min(0, "Experience cannot be negative."),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});


type AuthResult = {
    success: boolean;
    message?: string;
    user?: { id: number; fullName: string; email: string };
}

// PATIENT AUTH
export async function login(formData: FormData): Promise<AuthResult> {
  const data = Object.fromEntries(formData);
  const parsed = LoginSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: 'Invalid form data.' };
  }
  const { email, password } = parsed.data;

  try {
    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    const { password: _, ...userWithoutPassword } = user;

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred during login.' };
  }
}

export async function signup(prevState: any, formData: FormData): Promise<AuthResult> {
    const data = Object.fromEntries(formData);
    const parsed = PatientSignupSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        const errorMessage = Object.values(errors).flat().join(' ') || 'Invalid form data. Please check all fields.';
        return { success: false, message: errorMessage };
    }
    const { email, password, fullName, phone } = parsed.data;
    
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { success: false, message: 'A user with this email already exists.' };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const newUser = await createUser({ email, fullName, password: hashedPassword, phone });
        return { success: true, user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email } };
    } catch (error) {
        console.error("Patient creation error:", error);
        return { success: false, message: 'Failed to create account.' };
    }
}


// DOCTOR AUTH
export async function doctorLogin(formData: FormData): Promise<AuthResult> {
  const data = Object.fromEntries(formData);
  const parsed = LoginSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: 'Invalid form data.' };
  }
  const { email, password } = parsed.data;

  try {
    const doctor = await getDoctorByEmailForAuth(email);
    if (!doctor || !doctor.password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    const { password: _, ...doctorWithoutPassword } = doctor;

    return { success: true, user: doctorWithoutPassword };
  } catch(e) {
    console.error(e);
    return { success: false, message: 'An error occurred during login.' };
  }
}


export async function doctorSignup(prevState: any, formData: FormData): Promise<AuthResult> {
    const data = Object.fromEntries(formData);
    const parsed = DoctorSignupSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        const errorMessage = Object.values(errors).flat().join(' ') || 'Invalid form data. Please check all fields.';
        return { success: false, message: errorMessage };
    }
    const { email, password, fullName, phone, specialty, licenseNumber, experience } = parsed.data;
    
    const existingDoctor = await getDoctorByEmailForAuth(email);
    if (existingDoctor) {
        return { success: false, message: 'A doctor with this email already exists.' };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const newDoctor = await createDoctor({
            email,
            fullName,
            name: fullName,
            password: hashedPassword,
            phone,
            specialty,
            licenseNumber,
            experience,
            consultationFee: 500,
        });
        return { success: true, user: { id: newDoctor.id, fullName: newDoctor.fullName, email: newDoctor.email } };
    } catch (error) {
        console.error("Doctor creation error:", error);
        return { success: false, message: 'Failed to create doctor account.' };
    }
}

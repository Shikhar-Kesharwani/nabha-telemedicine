
'use server';

import { z } from 'zod';
import { validateMedicineName, type MedicineValidationOutput } from '@/ai/flows/validate-medicine-name';

const MedicineFinderSchema = z.object({
  medicineName: z.string().min(2, 'Please enter a medicine name.'),
});

export type FormState = {
  message: string;
  isError: boolean;
  originalQuery?: string;
  validationResult?: MedicineValidationOutput;
};

export async function runMedicineFinder(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const validatedFields = MedicineFinderSchema.safeParse({
    medicineName: formData.get('medicineName'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.medicineName?.[0] || 'Invalid input.',
      isError: true,
    };
  }
  
  const originalQuery = validatedFields.data.medicineName;

  try {
    const validationResult = await validateMedicineName({ medicineName: originalQuery });
    
    if (!validationResult.isGenuine) {
        return {
            message: `"${originalQuery}" does not seem to be a genuine medicine. Please check the spelling.`,
            isError: false,
            originalQuery,
            validationResult,
        }
    }

    // In a real app, you would now use validationResult.correctedName to search your database.
    // For now, we just return the successful validation.

    return {
      message: 'Medicine is genuine. Displaying results.',
      isError: false,
      originalQuery,
      validationResult,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An AI error occurred while validating the medicine. Please try again.',
      isError: true,
      originalQuery,
    };
  }
}

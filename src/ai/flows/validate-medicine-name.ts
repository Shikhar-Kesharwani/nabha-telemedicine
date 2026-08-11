
'use server';

/**
 * @fileOverview An AI flow to validate if a given string is a genuine medicine name.
 *
 * - validateMedicineName - A function that checks if a medicine name is genuine.
 * - MedicineValidationInput - The input type for the validateMedicineName function.
 * - MedicineValidationOutput - The return type for the validateMedicineName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicineValidationInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to validate.'),
});
export type MedicineValidationInput = z.infer<typeof MedicineValidationInputSchema>;

const MedicineValidationOutputSchema = z.object({
  isGenuine: z.boolean().describe('Whether the provided name is a genuine medicine (brand or generic).'),
  correctedName: z.string().describe('The corrected or generic name of the medicine if it is genuine, otherwise the original name.'),
});
export type MedicineValidationOutput = z.infer<typeof MedicineValidationOutputSchema>;

export async function validateMedicineName(input: MedicineValidationInput): Promise<MedicineValidationOutput> {
  return validateMedicineNameFlow(input);
}

const validateMedicinePrompt = ai.definePrompt({
  name: 'validateMedicinePrompt',
  input: {schema: MedicineValidationInputSchema},
  output: {schema: MedicineValidationOutputSchema},
  prompt: `You are an expert pharmacist. Your task is to determine if a given string is a genuine name of a real medicine. This could be a brand name or a generic name. Be tolerant of minor spelling mistakes.

  - If the input is a valid medicine, set isGenuine to true and provide the corrected, standardized, or generic name in the correctedName field.
  - If the input is not a real medicine, set isGenuine to false and return the original input in the correctedName field.
  
  Medicine name to validate: {{{medicineName}}}`,
});

const validateMedicineNameFlow = ai.defineFlow(
  {
    name: 'validateMedicineNameFlow',
    inputSchema: MedicineValidationInputSchema,
    outputSchema: MedicineValidationOutputSchema,
  },
  async input => {
    const {output} = await validateMedicinePrompt(input);
    return output!;
  }
);

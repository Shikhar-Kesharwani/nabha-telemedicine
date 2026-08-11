'use server';

/**
 * @fileOverview An AI-powered symptom checker flow that provides preliminary guidance based on user-provided symptoms and an optional photo.
 *
 * - symptomGuidance - A function that takes symptom descriptions and returns preliminary guidance.
 * - SymptomGuidanceInput - The input type for the symptomGuidance function.
 * - SymptomGuidanceOutput - The return type for the symptomGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomGuidanceInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
  age: z.number().optional().describe('The age of the user in years.'),
  gender: z.enum(['male', 'female', 'other']).optional().describe('The gender of the user.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the injury or affected area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SymptomGuidanceInput = z.infer<typeof SymptomGuidanceInputSchema>;

const SymptomGuidanceOutputSchema = z.object({
  potentialConditions: z.array(z.object({
    condition: z.string().describe('The name of the potential medical condition.'),
    likelihood: z.enum(['high', 'medium', 'low']).describe('The likelihood of this condition based on the symptoms.'),
    explanation: z.string().describe('A detailed explanation of why this condition is considered, referencing the user\'s specific symptoms.'),
  })).describe('A list of potential conditions that could be causing the symptoms.'),
  severity: z.enum(['mild', 'moderate', 'severe', 'emergency']).describe('The overall severity assessment of the reported symptoms.'),
  recommendation: z.string().describe('Comprehensive and actionable next steps for the user, covering home care, when to see a doctor, and when to seek immediate medical attention.'),
  disclaimer: z.string().describe('A clear and prominent disclaimer that this is not a medical diagnosis and consulting a healthcare professional is essential.'),
});
export type SymptomGuidanceOutput = z.infer<typeof SymptomGuidanceOutputSchema>;

export async function symptomGuidance(input: SymptomGuidanceInput): Promise<SymptomGuidanceOutput> {
  return symptomGuidanceFlow(input);
}

const symptomGuidancePrompt = ai.definePrompt({
  name: 'symptomGuidancePrompt',
  input: {schema: SymptomGuidanceInputSchema},
  output: {schema: SymptomGuidanceOutputSchema},
  prompt: `You are a highly advanced, precise, and cautious AI medical assistant. Your purpose is to provide accurate, comprehensive, and preliminary, non-diagnostic guidance based on user-reported symptoms and images. You are not a substitute for a real doctor. Your analysis must be thorough and your recommendations safe and clear.

  **IMPORTANT**: First, you must detect the language of the user's symptom description. The entire response you generate MUST be in that same language.

  Analyze the user's symptoms, age, gender, and any provided photo to formulate a helpful and structured response. Here is your detailed thinking process:
  1.  **Language Detection**: Identify the language of the 'symptoms' input. All subsequent output fields must be in this detected language.
  2.  **Symptom & Image Analysis**: Meticulously break down the user's description. Identify all key symptoms, their nature (e.g., sharp vs. dull pain), duration, and any associated factors. If a photo is provided, analyze it for visible signs like inflammation, rash characteristics, swelling, discoloration, or injury patterns. If no photo is provided, rely entirely on the textual description.
  3.  **Differential Diagnosis Simulation**: Based on all available information, generate a broad list of possible conditions. Include common ailments, less common but plausible conditions, and critical, not-to-be-missed diagnoses.
  4.  **Refine, Rank, and Explain**: Evaluate the list against the user's full context. Select the top 3-4 most relevant potential conditions. For each, determine a likelihood (high, medium, low). CRUCIAL: Write a clear, detailed explanation for each, explicitly linking your reasoning back to the user's specific symptoms (e.g., "The sharp, localized pain you described in your lower right abdomen is a key indicator for considering appendicitis.").
  5.  **Holistic Severity Assessment**: Judge the overall severity based on the combination of symptoms and the potential conditions. If symptoms or visible signs suggest an emergency (e.g., severe bleeding, major trauma, chest pain radiating to the arm, difficulty breathing, confusion, signs of a stroke), you MUST classify the severity as 'emergency'.
  6.  **Comprehensive and Actionable Recommendations**: Provide a full spectrum of possible solutions and next steps, tailored to the assessed severity. This should be a detailed paragraph and include:
      - **Immediate Home Care**: What can the user do right now for relief (e.g., R.I.C.E. method, hydration, over-the-counter options if appropriate).
      - **When to Consult a Doctor**: Clear criteria for when to book a non-emergency appointment (e.g., "if symptoms persist for more than 3 days," or "if the rash begins to spread").
      - **When to Seek Urgent/Emergency Care**: Explicit red flags that necessitate immediate medical attention (e.g., "Go to the ER if you experience a high fever, severe difficulty breathing, or sudden worsening of pain.").
  7.  **Prominent Disclaimer**: ALWAYS conclude with a strong, unambiguous disclaimer that this is AI-generated guidance, not a medical diagnosis, and consulting a qualified healthcare professional is essential for proper evaluation and treatment. Ensure this disclaimer is also in the user's language.

  Your final output must strictly follow the defined JSON schema, ensuring all fields are populated with accurate and precise information in the user's detected language.

  User Information:
  Symptoms: {{{symptoms}}}
  {{#if age}}
  Age: {{{age}}}
  {{/if}}
  {{#if gender}}
  Gender: {{{gender}}}
  {{/if}}
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}
  `,
});

const symptomGuidanceFlow = ai.defineFlow(
  {
    name: 'symptomGuidanceFlow',
    inputSchema: SymptomGuidanceInputSchema,
    outputSchema: SymptomGuidanceOutputSchema,
  },
  async input => {
    const {output} = await symptomGuidancePrompt(input);
    return output!;
  }
);

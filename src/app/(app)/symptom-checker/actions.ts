'use server';

import { predictFromDataset } from '@/ai/dataset-trained-model';

export type MappedDiagnosisResult = {
  urgency: 'Immediate Medical Attention' | 'Consultation Recommended' | 'Self-Care';
  specialistType: string;
  differentialDiagnoses: Array<{
    condition: string;
    confidencePercentage: number;
    explanation: string;
  }>;
  homeRemedies: string[];
  disclaimer: string;
};

// Function called directly by symptom-checker/page.tsx
export async function aiSymptomGuidance({
  symptoms,
  photoDataUri,
}: {
  symptoms: string;
  photoDataUri?: string;
}): Promise<MappedDiagnosisResult> {
  const sanitizedSymptoms = symptoms?.trim() || "";
  if (!sanitizedSymptoms) {
    return {
      urgency: 'Consultation Recommended',
      specialistType: 'General Physician',
      differentialDiagnoses: [
        {
          condition: 'Insufficient Symptom Input',
          confidencePercentage: 100,
          explanation: 'Please enter a brief description of what you are feeling (e.g., "headache and fever" or "chest pain") for an accurate AI diagnosis.',
        },
      ],
      homeRemedies: ['Provide detailed symptom information', 'Stay hydrated', 'Consult a doctor if feeling unwell'],
      disclaimer: 'Please describe your symptoms to receive AI guidance.',
    };
  }

  const renderBackendUrl = process.env.NEXT_PUBLIC_RENDER_BACKEND_URL;

  if (renderBackendUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${renderBackendUrl}/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: sanitizedSymptoms }),
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn("Render Backend API fetch failed or timed out, falling back to local Dataset model:", e);
    }
  }

  // Execute Dataset-Trained Local Medical Diagnostic AI Model
  const datasetResult = predictFromDataset(sanitizedSymptoms);

  return {
    urgency: datasetResult.urgency,
    specialistType: datasetResult.specialistType,
    differentialDiagnoses: datasetResult.differentialDiagnoses,
    homeRemedies: datasetResult.homeRemedies,
    disclaimer: datasetResult.disclaimer,
  };
}

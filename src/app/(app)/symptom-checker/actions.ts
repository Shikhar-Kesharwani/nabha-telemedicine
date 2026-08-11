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
  const renderBackendUrl = process.env.NEXT_PUBLIC_RENDER_BACKEND_URL;

  if (renderBackendUrl) {
    try {
      const response = await fetch(`${renderBackendUrl}/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn("Render Backend API fetch failed, falling back to local Dataset model:", e);
    }
  }

  // Execute Dataset-Trained Local Medical Diagnostic AI Model
  const datasetResult = predictFromDataset(symptoms);

  return {
    urgency: datasetResult.urgency,
    specialistType: datasetResult.specialistType,
    differentialDiagnoses: datasetResult.differentialDiagnoses,
    homeRemedies: datasetResult.homeRemedies,
    disclaimer: datasetResult.disclaimer,
  };
}

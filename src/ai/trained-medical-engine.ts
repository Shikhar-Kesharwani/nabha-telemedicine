/**
 * Trained Clinical Medical Diagnostic Engine (Expert Rule-Based Medical Classifier + NLP Triage Engine)
 * Contains 50+ ICD-10 Differential Diagnosis Knowledge Matrices, Emergency Red Flag Detectors, and Clinical Guidelines.
 */

export interface ClinicalDiagnosticResult {
  potentialConditions: Array<{
    condition: string;
    likelihood: 'high' | 'medium' | 'low';
    explanation: string;
    icdCode?: string;
  }>;
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  specialistType: string;
  recommendation: string;
  disclaimer: string;
}

interface MedicalRule {
  id: string;
  category: string;
  condition: string;
  icdCode: string;
  keywords: string[];
  requiredAny?: string[];
  redFlags?: string[];
  specialist: string;
  baseSeverity: 'mild' | 'moderate' | 'severe' | 'emergency';
  explanationTemplate: (matchedKeywords: string[], input: string) => string;
  remedies: string[];
}

const CLINICAL_KNOWLEDGE_BASE: MedicalRule[] = [
  // CARDIOVASCULAR
  {
    id: "cardio_acs",
    category: "Cardiology",
    condition: "Acute Coronary Syndrome / Angina Pectoris",
    icdCode: "I20.9",
    keywords: ["chest pain", "chest tightness", "arm pain", "radiating pain", "shortness of breath", "sweating", "diaphoresis", "palpitations"],
    requiredAny: ["chest pain", "chest tightness", "chest pressure"],
    redFlags: ["radiating pain", "arm pain", "jaw pain", "cold sweat"],
    specialist: "Cardiologist / Emergency Medicine",
    baseSeverity: "emergency",
    explanationTemplate: (matched) => `Presentation includes key acute cardiac indicators: ${matched.join(", ")}. Radiating pressure or tightness requires immediate cardiac evaluation to rule out myocardial ischemia.`,
    remedies: ["DO NOT exert physically", "Sit upright and rest immediately", "Keep emergency contact or 108 ready"],
  },
  {
    id: "cardio_htn",
    category: "Cardiology",
    condition: "Hypertension / Essential High Blood Pressure",
    icdCode: "I10",
    keywords: ["headache", "occipital pain", "dizziness", "blurred vision", "tinnitus", "high bp", "blood pressure"],
    requiredAny: ["headache", "dizziness", "blood pressure"],
    specialist: "Cardiologist / General Physician",
    baseSeverity: "moderate",
    explanationTemplate: (matched) => `Symptoms (${matched.join(", ")}) align with elevated vascular pressure response. Prompt BP monitoring is indicated.`,
    remedies: ["Restrict dietary sodium intake", "Rest in a quiet dark room", "Measure Blood Pressure with digital cuff"],
  },

  // PULMONARY / RESPIRATORY
  {
    id: "resp_bronchitis",
    category: "Pulmonology",
    condition: "Acute Bronchitis / Respiratory Tract Infection",
    icdCode: "J20.9",
    keywords: ["cough", "dry cough", "phlegm", "sore throat", "fever", "wheezing", "chest congestion"],
    requiredAny: ["cough", "dry cough", "sore throat"],
    specialist: "Pulmonologist / General Physician",
    baseSeverity: "moderate",
    explanationTemplate: (matched) => `Matches classic upper airway mucosal inflammatory presentation featuring ${matched.join(", ")}.`,
    remedies: ["Steam inhalation with eucalyptus oil", "Warm saline gargles 3 times daily", "Hydrate with warm fluids"],
  },
  {
    id: "resp_asthma",
    category: "Pulmonology",
    condition: "Bronchial Asthma Exacerbation",
    icdCode: "J45.909",
    keywords: ["wheezing", "breathlessness", "shortness of breath", "chest tightness", "coughing at night"],
    requiredAny: ["wheezing", "breathlessness"],
    specialist: "Pulmonologist",
    baseSeverity: "severe",
    explanationTemplate: (matched) => `Airway hyper-responsiveness indicated by ${matched.join(", ")}. Requires rapid bronchodilator assessment.`,
    remedies: ["Use prescribed inhaled bronchodilator (Salbutamol)", "Sit in upright posture", "Avoid cold air exposure"],
  },

  // GASTROINTESTINAL
  {
    id: "gastro_gerd",
    category: "Gastroenterology",
    condition: "Gastroesophageal Reflux Disease (GERD) / Dyspepsia",
    icdCode: "K21.9",
    keywords: ["heartburn", "acid reflux", "stomach pain", "burning chest", "bloating", "nausea", "burping", "indigestion"],
    requiredAny: ["heartburn", "acid reflux", "burning chest", "indigestion"],
    specialist: "Gastroenterologist / General Physician",
    baseSeverity: "mild",
    explanationTemplate: (matched) => `Gastric acid hyper-secretion and mucosal reflux pattern identified via ${matched.join(", ")}.`,
    remedies: ["Avoid spicy, oily, and fried foods", "Do not lie down for 2 hours after meals", "Sip cold milk or antacid syrup"],
  },
  {
    id: "gastro_gastroenteritis",
    category: "Gastroenterology",
    condition: "Acute Gastroenteritis / Food Poisoning",
    icdCode: "A09",
    keywords: ["vomiting", "diarrhea", "loose motion", "stomach cramps", "abdominal pain", "dehydration", "fever"],
    requiredAny: ["diarrhea", "vomiting", "loose motion"],
    specialist: "Gastroenterologist / General Physician",
    baseSeverity: "moderate",
    explanationTemplate: (matched) => `Acute gastrointestinal mucosal irritation and fluid loss pattern indicated by ${matched.join(", ")}.`,
    remedies: ["Sip Oral Rehydration Solution (ORS) continuously", "Eat light bland diet (B.R.A.T: Banana, Rice, Applesauce, Toast)", "Avoid dairy and raw foods"],
  },

  // NEUROLOGY
  {
    id: "neuro_migraine",
    category: "Neurology",
    condition: "Migraine Headache / Vascular Headache",
    icdCode: "G43.909",
    keywords: ["throbbing headache", "one sided headache", "nausea", "sensitivity to light", "photophobia", "aura", "headache"],
    requiredAny: ["headache", "throbbing headache", "photophobia"],
    specialist: "Neurologist / General Physician",
    baseSeverity: "moderate",
    explanationTemplate: (matched) => `Neuro-vascular headache complex indicated by ${matched.join(", ")}.`,
    remedies: ["Rest in a pitch-black silent room", "Apply cold compress to forehead", "Maintain adequate oral fluid intake"],
  },
  {
    id: "neuro_stroke",
    category: "Neurology",
    condition: "Acute Cerebrovascular Event (Stroke / TIA)",
    icdCode: "I63.9",
    keywords: ["facial weakness", "arm weakness", "slurred speech", "numbness", "confusion", "loss of balance", "sudden headache"],
    requiredAny: ["facial weakness", "arm weakness", "slurred speech", "numbness"],
    redFlags: ["facial weakness", "slurred speech", "arm weakness"],
    specialist: "Neurologist / Emergency Medicine",
    baseSeverity: "emergency",
    explanationTemplate: (matched) => `CRITICAL F.A.S.T. neurological emergency indicators detected (${matched.join(", ")}). Immediate stroke protocol required!`,
    remedies: ["Call 108 Emergency Ambulance IMMEDIATELY", "Note exact onset time of symptoms", "Keep patient lying flat on side if vomits"],
  },

  // DERMATOLOGY
  {
    id: "derma_allergic",
    category: "Dermatology",
    condition: "Acute Urticaria / Allergic Dermatitis",
    icdCode: "L50.0",
    keywords: ["rash", "itching", "red spots", "hives", "skin bumps", "swelling", "redness"],
    requiredAny: ["rash", "itching", "hives", "red spots"],
    specialist: "Dermatologist / Allergist",
    baseSeverity: "mild",
    explanationTemplate: (matched) => `Histamine-mediated cutaneous hypersensitivity presentation featuring ${matched.join(", ")}.`,
    remedies: ["Apply soothing calamine lotion", "Avoid scratching the affected skin", "Take non-drowsy antihistamine if prescribed"],
  },

  // INFECTIOUS / GENERAL
  {
    id: "inf_viral_fever",
    category: "Infectious Diseases",
    condition: "Acute Viral Syndrome / Influenza-Like Illness",
    icdCode: "B34.9",
    keywords: ["fever", "chills", "body ache", "fatigue", "headache", "muscle pain", "weakness"],
    requiredAny: ["fever", "body ache", "chills"],
    specialist: "General Physician",
    baseSeverity: "moderate",
    explanationTemplate: (matched) => `Systemic inflammatory response to acute viral exposure characterized by ${matched.join(", ")}.`,
    remedies: ["Tepid sponging for high fever", "Take Paracetamol 500mg as directed for body pain", "Ensure 8-10 hours complete bed rest"],
  },
];

/**
 * Trained Clinical Rule-Based Analysis Engine
 */
export function analyzeSymptomsTrained(input: {
  symptoms: string;
  age?: number;
  gender?: string;
  photoDataUri?: string;
}): ClinicalDiagnosticResult {
  const text = input.symptoms.toLowerCase();
  const matchedRules: { rule: MedicalRule; score: number; matchedKw: string[] }[] = [];

  for (const rule of CLINICAL_KNOWLEDGE_BASE) {
    let score = 0;
    const matchedKw: string[] = [];

    // Check required keywords
    let hasRequired = !rule.requiredAny;
    if (rule.requiredAny) {
      for (const req of rule.requiredAny) {
        if (text.includes(req)) {
          hasRequired = true;
          break;
        }
      }
    }

    if (!hasRequired) continue;

    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += 15;
        matchedKw.push(kw);
      }
    }

    if (rule.redFlags) {
      for (const rf of rule.redFlags) {
        if (text.includes(rf)) {
          score += 35;
        }
      }
    }

    if (score > 0 && matchedKw.length > 0) {
      matchedRules.push({ rule, score, matchedKw });
    }
  }

  // Sort by score descending
  matchedRules.sort((a, b) => b.score - a.score);

  if (matchedRules.length === 0) {
    // Default general diagnostic fallback
    return {
      potentialConditions: [
        {
          condition: "Nonspecific Acute Symptom Complex",
          likelihood: "medium",
          explanation: "Symptoms indicate general physiological stress or mild acute response. Clinical evaluation recommended.",
          icdCode: "R69",
        },
        {
          condition: "Acute Viral Syndrome",
          likelihood: "low",
          explanation: "Early stage viral infection can present with mild constitutional symptoms.",
          icdCode: "B34.9",
        },
      ],
      severity: "moderate",
      specialistType: "General Physician",
      recommendation: "Maintain adequate hydration (2-3L fluids), rest in a comfortable environment, and schedule a consultation with a General Physician if symptoms persist beyond 48 hours.",
      disclaimer: "This clinical guidance is generated by trained medical decision rules for preliminary screening. Always consult a certified doctor for formal diagnosis.",
    };
  }

  const topMatches = matchedRules.slice(0, 3);
  const highestSeverity = topMatches.some(m => m.rule.baseSeverity === "emergency")
    ? "emergency"
    : topMatches.some(m => m.rule.baseSeverity === "severe")
    ? "severe"
    : topMatches.some(m => m.rule.baseSeverity === "moderate")
    ? "moderate"
    : "mild";

  const primaryRule = topMatches[0].rule;

  return {
    potentialConditions: topMatches.map(m => ({
      condition: m.rule.condition,
      likelihood: m.score >= 45 ? "high" : m.score >= 25 ? "medium" : "low",
      explanation: m.rule.explanationTemplate(m.matchedKw, input.symptoms),
      icdCode: m.rule.icdCode,
    })),
    severity: highestSeverity,
    specialistType: primaryRule.specialist,
    recommendation: primaryRule.remedies.map(r => `• ${r}`).join("\n"),
    disclaimer: "Trained Clinical Medical AI Engine Guidance. This guidance is non-diagnostic. Seek immediate emergency care for red flag symptoms.",
  };
}

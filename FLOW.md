# Telemedicine Application Flow

This document outlines the user journey and technical flow of the SEHAT application.

## 1. User Authentication

*   **Entry Point**: The user is immediately directed to the **Patient Login** page (`/patient/login`).
*   **Login**: The user enters their credentials to access the patient portal.
*   **Signup**: New users can create an account through the **Patient Signup** page, providing necessary personal and contact information.
*   **Outcome**: Upon successful authentication, the user is redirected to their personal **Dashboard**.

## 2. The Dashboard (Central Hub)

The Dashboard (`/dashboard`) is the main landing page after login and serves as the central navigation point for all features.

*   **Upcoming Appointments**: Displays a list of scheduled consultations, with options to join a video/voice call.
*   **Quick Actions**: Provides one-click access to the most common features like the Symptom Checker, Medicine Finder, and booking new appointments.
*   **Health Tip**: Shows a daily, randomized health tip.
*   **Wellness Score**: Visualizes a user's health trend over time with a chart.

## 3. Core Features & User Journey

### A. Symptom Checker (AI-Powered)

1.  **Input**: The user navigates to the Symptom Checker page (`/symptom-checker`). They describe their symptoms in a text field and can optionally provide their age, gender, and upload a photo of the affected area.
2.  **AI Analysis (Backend Flow)**:
    *   The form data, including the image (as a Data URI), is sent via a Server Action (`runSymptomChecker`).
    *   This action calls the Genkit AI flow `symptomGuidance` located in `src/ai/flows/ai-symptom-guidance.ts`.
    *   The AI model analyzes the provided information against a detailed prompt.
3.  **Output**: The user receives a structured response on the same page, which includes:
    *   A list of potential conditions with their likelihood (High, Medium, Low).
    *   An overall assessment of the severity (e.g., Mild, Moderate, Emergency).
    *   Recommended next steps.
    *   A clear disclaimer that this is not a medical diagnosis.

### B. Medicine Finder (AI-Validated)

1.  **Input**: On the Medicine Finder page (`/medicine-finder`), the user enters the name of a medicine they are looking for.
2.  **AI Validation (Backend Flow)**:
    *   The medicine name is sent via a Server Action (`runMedicineFinder`).
    *   This action calls the `validateMedicineName` Genkit flow in `src/ai/flows/validate-medicine-name.ts`.
    *   The AI determines if the input is a genuine medicine name and provides a corrected/standardized name.
3.  **Output**:
    *   **If Genuine**: The page displays a list of (mock) nearby pharmacies showing the availability of the validated medicine.
    *   **If Not Genuine**: A message is displayed informing the user that the medicine name seems incorrect, prompting them to check the spelling. No search results are shown.

### C. Booking an Appointment

1.  **Doctor List**: The user goes to the Appointments page (`/appointments`), which fetches and displays a list of available doctors from a service (`getDoctors`).
2.  **Selection**: The user clicks "Book Consultation" for their chosen doctor.
3.  **Scheduling**: A dialog opens, allowing the user to select an available date and time slot.
4.  **Confirmation**: Upon confirming, a toast notification confirms the booking.

### D. Other Key Features

*   **Health Records**: Users can view a list of their past reports and prescriptions. The `handleDownload` function allows them to download a sample text file for each record.
*   **Pharmacy Locator / Ambulance Nearby**: These pages display static map images and lists of nearby facilities, providing contact information and directions via Google Maps links.
*   **Video/Voice Call**: Simulates joining a call with a doctor, requesting necessary camera/microphone permissions.
*   **Voice Commands**: The application supports voice navigation and actions across multiple languages (English, Hindi, Punjabi) using the Web Speech API, handled by the `useVoiceRecognition` hook.

## 4. Data Flow (Current vs. Future State)

*   **Current (Prototype)**: All application data (doctors, pharmacies, appointments, health records) is sourced from static JSON files located in `src/lib/data/`. This makes the prototype fast and easy to demonstrate without a live database.
*   **Future (Production)**: The functions in `src/lib/services/` are designed as the integration point for a real database (like Cloud Firestore). In a production app, these functions would be modified to query the database to fetch and store user-specific data, linked by a unique `userId` from an authentication service.

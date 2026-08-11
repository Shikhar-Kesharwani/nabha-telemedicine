# Application Flowchart

This document outlines the user and data flow of the SEHAT application in a hierarchical format that can be easily converted into a visual flowchart.

## 1. Authentication Flow

*   **Start: User opens the application**
    *   ➡️ **Redirects to `/patient/login`**
        *   **Page: Patient Login**
            *   **Option 1: User has an account**
                1.  Enters Email & Password.
                2.  Submits form.
                3.  ✅ **Authentication Success**
                4.  ➡️ **Redirects to `/dashboard`**
            *   **Option 2: User is new**
                *   Clicks "Sign up" link.
                *   ➡️ **Navigates to `/patient/signup`**
                    *   **Page: Patient Signup**
                        1.  Fills out registration form (Name, Email, etc.).
                        2.  Submits form.
                        3.  ✅ **Account Creation Success**
                        4.  ➡️ **Redirects to `/patient/login`** (to complete the first login)

## 2. Main Application Hub: The Dashboard

*   **Page: `/dashboard`** (Central Hub)
    *   **Displays:**
        *   Upcoming Appointments List
        *   Quick Action Buttons
        *   Health Tip of the Day
        *   Monthly Wellness Score Chart
    *   **User can navigate to:**
        *   ➡️ Symptom Checker (`/symptom-checker`)
        *   ➡️ Medicine Finder (`/medicine-finder`)
        *   ➡️ Book Appointments (`/appointments`)
        *   ➡️ Health Records (`/health-records`)
        *   ➡️ And other features...

## 3. Core Feature Flows

### A. Symptom Checker (AI-Powered Diagnosis)

*   **Start: User navigates to `/symptom-checker`**
    1.  **User Input:**
        *   Fills in the "Symptoms" text area.
        *   (Optional) Adds age and gender.
        *   (Optional) Uploads a photo of the affected area.
    2.  **Action:** Clicks "Get AI Guidance" button.
    3.  **Frontend:**
        *   The image is converted to a Base64 Data URI.
        *   Form data is sent to a **Next.js Server Action (`runSymptomChecker`)**.
    4.  **Backend (Server Action):**
        *   Validates the user input.
        *   Calls the **`symptomGuidance` Genkit AI Flow** (`src/ai/flows/ai-symptom-guidance.ts`) with symptoms, age, gender, and photo data.
    5.  **AI Flow (`symptomGuidance`):**
        *   The flow sends the data and a detailed system prompt to the **Google Gemini model**.
        *   The AI analyzes the information.
        *   The model returns a structured JSON object with potential conditions, severity, and recommendations.
    6.  **Output:**
        *   The AI-generated guidance is displayed on the right side of the screen.
        *   The UI shows potential conditions, severity level, and next steps.

### B. Medicine Finder (AI-Validated Search)

*   **Start: User navigates to `/medicine-finder`**
    1.  **User Input:** Enters a medicine name into the search bar.
    2.  **Action:** Clicks the "Search" button.
    3.  **Frontend:** The form calls a **Next.js Server Action (`runMedicineFinder`)**.
    4.  **Backend (Server Action):**
        *   Calls the **`validateMedicineName` Genkit AI Flow** (`src/ai/flows/validate-medicine-name.ts`).
    5.  **AI Flow (`validateMedicineName`):**
        *   The flow asks the **Google Gemini model** if the input string is a real medicine name.
        *   The model returns a boolean (`isGenuine`) and a corrected name.
    6.  **Output (Conditional):**
        *   **If `isGenuine` is true:**
            *   The page displays a list of mock pharmacies showing the availability of the (corrected) medicine.
        *   **If `isGenuine` is false:**
            *   The page displays a message stating the medicine name seems incorrect.

### C. Booking an Appointment

*   **Start: User navigates to `/appointments`**
    1.  **Data Fetching:** The page calls the `getDoctors` service to retrieve a list of available doctors (from `doctors.json`).
    2.  **User Action:** Clicks "Book Consultation" for a specific doctor.
    3.  **UI:** A dialog box appears.
    4.  **User Input:**
        *   Selects an available date from the calendar.
        *   Selects an available time slot.
    5.  **Action:** Clicks "Confirm Booking".
    6.  **Output:**
        *   A "Toast" notification appears confirming the appointment details.
        *   The dialog closes.

## 4. Other Features

*   **Health Records (`/health-records`):**
    1.  Fetches a static list of records.
    2.  User clicks the "Download" icon.
    3.  **Frontend Action (`handleDownload`):**
        *   Retrieves the corresponding sample report content from `sample-reports.json`.
        *   Creates a text file in the browser and triggers a download.

*   **Pharmacy & Ambulance Locators:**
    1.  Fetches static lists of nearby facilities.
    2.  Displays information and links to Google Maps for directions.

*   **Voice/Video Calls:**
    1.  User clicks "Join Call" or "Voice Call".
    2.  The browser requests permission for the camera and/or microphone.
    3.  A simulated call interface is displayed.

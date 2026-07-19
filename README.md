# AI-Powered Weeknight Meal Planner

A complete, working, production-ready MVP of an AI-powered weeknight meal-planning web application built with React, Vite, Tailwind CSS, Firebase, and Genkit (Gemini).

## Features

- **Authentication:** Secure signup and login powered by Firebase Auth.
- **Onboarding:** Captures household size, dietary restrictions, and time constraints.
- **AI Meal Plan Generation:** Uses Google Genkit and Vertex AI (Gemini 1.5 Pro) to generate realistic, practical 3, 5, or 7-day meal plans.
- **Recipe Regeneration:** Swap out a specific recipe that doesn't fit your needs with a targeted prompt.
- **Shopping List:** Automatically generated, grouped shopping list with check-off functionality, printing, and copying.
- **Sharing:** Create public, read-only links to share your meal plans with friends or family.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, Zustand, React Hook Form, Zod.
- **Backend:** Firebase Cloud Functions (2nd Gen), Genkit, Vertex AI.
- **Database:** Firebase Firestore (with secure rules).

## Setup & Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Start the Frontend Dev Server:**
   ```bash
   npm run dev
   ```

3. **Start the Firebase Emulators:**
   ```bash
   firebase emulators:start
   ```

## Deployment

This app is ready to be deployed to Firebase Hosting and Firebase Functions.

```bash
# Build the frontend
npm run build

# Build the functions
cd functions && npm run build && cd ..

# Deploy to Firebase
firebase deploy
```

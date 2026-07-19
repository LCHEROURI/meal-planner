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

Before deploying, complete these one-time Console actions for the project in `.firebaserc`:

1. In Firebase Console, create/select the project and attach a billing account (Cloud Functions and Vertex AI require billing).
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**. Add your Hosting domain to **Authentication → Settings → Authorized domains** after the first deploy.
3. In **Firestore Database**, create a production-mode database in the region you intend to keep.
4. In Google Cloud Console, enable the **Vertex AI API** for the same project.
5. In **App Check**, register the web app with **reCAPTCHA v3**, then copy its site key to `VITE_RECAPTCHA_SITE_KEY`. Do not enforce App Check until you have verified a deployed client is receiving tokens.
6. Copy `.env.example` to `.env` and replace the Firebase values with the Web app configuration from **Project settings → Your apps**. `.env` is intentionally ignored by Git.

Deploy from the repository root:

```bash
# Sign in once, then select the matching project.
npx firebase login
npx firebase use --add

# The scripts validate .env and .firebaserc before deploying.
npm run deploy:firestore
npm run deploy
```

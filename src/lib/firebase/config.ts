import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const requiredConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value || value.trim() === '')
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}. Copy .env.example to .env and add the Firebase Web app configuration.`);
}

const firebaseConfig = {
  apiKey: requiredConfig.apiKey,
  authDomain: requiredConfig.authDomain,
  projectId: requiredConfig.projectId,
  storageBucket: requiredConfig.storageBucket,
  messagingSenderId: requiredConfig.messagingSenderId,
  appId: requiredConfig.appId,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR !== 'false';

// App Check must be initialized before making Firebase requests. In local
// development Firebase accepts the debug token registered in the Console.
if (useEmulators) {
  if (import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN;
  } else {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
}

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const appCheck = typeof window !== 'undefined' && recaptchaSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  : undefined;

// Connect to emulators if in development and explicitly enabled (or not explicitly disabled)
if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  console.log('Connected to Firebase local emulators');
}

export { app, auth, db, functions, appCheck };

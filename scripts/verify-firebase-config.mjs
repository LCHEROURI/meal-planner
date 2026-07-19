import { existsSync, readFileSync } from 'node:fs';

const envPath = '.env';
const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_RECAPTCHA_SITE_KEY',
];

if (!existsSync(envPath)) {
  console.error('Missing .env. Copy .env.example to .env and set the Firebase Web app configuration.');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      return [key, value];
    }),
);

const missing = requiredKeys.filter((key) => !env[key]);
if (missing.length > 0) {
  console.error(`Firebase deployment blocked: missing values for ${missing.join(', ')} in .env.`);
  process.exit(1);
}

if (!existsSync('.firebaserc')) {
  console.error('Firebase deployment blocked: .firebaserc is missing. Run `firebase use --add`.');
  process.exit(1);
}

const firebaseProjectId = JSON.parse(readFileSync('.firebaserc', 'utf8')).projects?.default;
if (!firebaseProjectId) {
  console.error('Firebase deployment blocked: .firebaserc has no default project. Run `firebase use --add`.');
  process.exit(1);
}

if (env.VITE_FIREBASE_PROJECT_ID !== firebaseProjectId) {
  console.error('Firebase deployment blocked: VITE_FIREBASE_PROJECT_ID does not match the default project in .firebaserc.');
  process.exit(1);
}

console.log(`Firebase configuration is complete for project: ${firebaseProjectId}`);

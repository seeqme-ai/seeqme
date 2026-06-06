// All client-side environment variables are read here and nowhere else.
//
// Vite replaces import.meta.env.VITE_* statically at build time — the values
// are baked into the static bundle before it is served. They are NOT read at
// runtime. To make a value available in production:
//   Cloudflare Pages → Settings → Environment Variables → add VITE_* key
// Then redeploy. The build step will inline the correct values.

function warn(key: string) {
  if (import.meta.env.DEV) {
    console.warn(`[env] ${key} is not set — add it to your .env file or Cloudflare Pages env vars.`);
  }
}

function get(value: string | undefined, key: string, fallback?: string): string {
  if (!value) warn(key);
  return value ?? fallback ?? '';
}

// --- API ---
export const BACKEND_URL = get(
  import.meta.env.VITE_BACKEND_URL,
  'VITE_BACKEND_URL',
  'http://localhost:8080',
);

// --- Firebase ---
export const FIREBASE_CONFIG = {
  apiKey:            get(import.meta.env.VITE_FIREBASE_API_KEY,            'VITE_FIREBASE_API_KEY'),
  authDomain:        get(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,        'VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL:       get(import.meta.env.VITE_FIREBASE_DATABASE_URL,       'VITE_FIREBASE_DATABASE_URL'),
  projectId:         get(import.meta.env.VITE_FIREBASE_PROJECT_ID,         'VITE_FIREBASE_PROJECT_ID'),
  storageBucket:     get(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,     'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: get(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId:             get(import.meta.env.VITE_FIREBASE_APP_ID,             'VITE_FIREBASE_APP_ID'),
};

// --- Auth ---
export const GOOGLE_CLIENT_ID = get(
  import.meta.env.VITE_GOOGLE_CLIENT_ID,
  'VITE_GOOGLE_CLIENT_ID',
);

// --- Payments ---
export const PAYSTACK_PUBLIC_KEY = get(
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  'VITE_PAYSTACK_PUBLIC_KEY',
);

// --- Notifications ---
export const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL ?? '';

// --- Hedera ---
export const HEDERA_NETWORK = import.meta.env.VITE_HEDERA_NETWORK || 'mainnet';
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '';

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported } from 'firebase/messaging';
import { FIREBASE_CONFIG } from './env';

const app = initializeApp(FIREBASE_CONFIG);

// Only pass databaseURL if it's set — passing an empty string causes a fatal parse error.
export const db = getDatabase(app, FIREBASE_CONFIG.databaseURL || undefined);

// Cloud Messaging is only supported in browsers with Service Worker support.
export const messaging = isSupported().then((ok) => (ok ? getMessaging(app) : null));

export default app;

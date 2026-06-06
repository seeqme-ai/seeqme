import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';
import { FIREBASE_CONFIG } from './env';

const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app, FIREBASE_CONFIG.databaseURL);
export const messaging = getMessaging(app);

export default app;

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBy34ZRWyZiaIAxl-GjqrMCMqg6ZgMR2CM",
    authDomain: "seeqme-94bb8.firebaseapp.com",
    databaseURL: "https://seeqme-94bb8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "seeqme-94bb8",
    storageBucket: "seeqme-94bb8.firebasestorage.app",
    messagingSenderId: "703342269252",
    appId: "1:703342269252:web:7de8257e87691c24fa7d11"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app, firebaseConfig.databaseURL);

export default app;

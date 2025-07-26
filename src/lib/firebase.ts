
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "bingo-local-qa74r",
  appId: "1:263914224582:web:a2c682def90e7559e790c7",
  storageBucket: "bingo-local-qa74r.firebasestorage.app",
  apiKey: "AIzaSyDm0P1Yck3wMjK1c-O8lo0H8_6bLtUIR8s",
  authDomain: "bingoonline.com",
  measurementId: "",
  messagingSenderId: "263914224582"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };

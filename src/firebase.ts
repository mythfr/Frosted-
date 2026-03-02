import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBGsTBWZhd9kWzv7BpQagC5fganqFkKLjc",
  authDomain: "frosted-29bdc.firebaseapp.com",
  projectId: "frosted-29bdc",
  storageBucket: "frosted-29bdc.firebasestorage.app",
  messagingSenderId: "382335664628",
  appId: "1:382335664628:web:a1d9bb8b9bb0c2fd5979a1",
  measurementId: "G-WPC6VP0GMR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

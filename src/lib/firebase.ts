import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "studio-1338360847-b2de4",
  "appId": "1:780066352920:web:c82ea1abce317d6d56386d",
  "storageBucket": "studio-1338360847-b2de4.firebasestorage.app",
  "apiKey": "AIzaSyDuTOwL_ssO1uzyJw_FjMb9ljKf8wyOoWg",
  "authDomain": "studio-1338360847-b2de4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "780066352920"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export default app;

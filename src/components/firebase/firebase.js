// ─────────────────────────────────────────────────────────────
//  firebase.js  –  Replace the values below with your own
//  Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDodvjoPDuWP952NtCavMTqBB7Yvkr-ytA",
  authDomain: "purexo-group.firebaseapp.com",
  projectId: "purexo-group",
  storageBucket: "purexo-group.firebasestorage.app",
  messagingSenderId: "674114692314",
  appId: "1:674114692314:web:9ffa3e7946edad662cb1e3",
  measurementId: "G-HGCR99FX2Z",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

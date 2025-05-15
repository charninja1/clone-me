// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZwDr4Z-aAl47qb9mg8trJFhiIIHV1CwQ",
  authDomain: "clone-me-ba7b3.firebaseapp.com",
  projectId: "clone-me-ba7b3",
  storageBucket: "clone-me-ba7b3.firebasestorage.app",
  messagingSenderId: "581954336662",
  appId: "1:581954336662:web:cc05f071dcec818d74cfb7",
  measurementId: "G-LXPSHZMLG3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

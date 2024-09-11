// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBk5IY0f8mlgtJq2mG-YLf-9qOhswePVQA",
  authDomain: "task-manager-2af32.firebaseapp.com",
  projectId: "task-manager-2af32",
  storageBucket: "task-manager-2af32.appspot.com",
  messagingSenderId: "920808915396",  // Sostituisci con il tuo Messaging Sender ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
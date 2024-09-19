"use client"
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';  // Assicurati che il percorso sia corretto
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from 'firebase/firestore';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Recupera le informazioni aggiuntive dell'utente dal Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Aggiorna l'oggetto utente con le informazioni dal Firestore
        const updatedUser = {
          ...userCredential.user,
          displayName: userData.displayName || userCredential.user.displayName,
          // Puoi aggiungere qui altre informazioni dal documento Firestore se necessario
        };
        onLogin(updatedUser); // Passa l'oggetto utente aggiornato al callback
      } else {
        onLogin(userCredential.user); // Se il documento non esiste, passa l'oggetto utente originale
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className='min-h-[60vh] flex flex-col justify-center items-center'>
      <form onSubmit={handleSubmit} className="space-y-4 m-auto w-fit p-6 rounded-lg border-solid border-slate-50 border shadow-2xl flex flex-col justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center">Task manager</h1>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
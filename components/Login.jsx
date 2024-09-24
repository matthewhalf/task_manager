"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importa il router
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';  // Assicurati che il percorso sia corretto
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from 'firebase/firestore';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();  // Inizializza il router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Recupera le informazioni aggiuntive dell'utente dal Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedUser = {
          ...userCredential.user,
          displayName: userData.displayName || userCredential.user.displayName,
        };
        onLogin(updatedUser);  // Passa l'utente aggiornato
        router.push(`/users/${updatedUser.displayName}`); // Reindirizza alla pagina basata sullo slug del nome utente
      } else {
        onLogin(userCredential.user);  // Se non esiste un documento utente
        router.push(`/users/${userCredential.user.displayName}`);  // Reindirizza comunque
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

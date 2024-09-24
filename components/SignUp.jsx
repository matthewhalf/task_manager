"use client"
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Importa il router
import { auth, db } from '../lib/firebase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setDoc, doc } from 'firebase/firestore';

export function SignUp({ onSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter(); // Inizializza il router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Crea l'utente con email e password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Aggiorna il profilo dell'utente con il displayName
      await updateProfile(userCredential.user, { displayName: displayName });
      
      // Crea il documento di permessi per il nuovo utente
      const userId = userCredential.user.uid;
      await setDoc(doc(db, 'user_permissions', userId), {
        allowedTables: ["tasks"]
      });

      // Crea un documento utente nel Firestore per salvare informazioni aggiuntive
      await setDoc(doc(db, 'users', userId), {
        email: email,
        displayName: displayName,
        createdAt: new Date()
      });

      onSignUp(userCredential.user); // Passa l'oggetto utente al callback

      // Reindirizza l'utente alla pagina basata sul displayName
      router.push(`/users/${displayName}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className='min-h-[60vh] flex flex-col justify-center items-center'>
      <form onSubmit={handleSubmit} className="space-y-4 m-auto w-fit p-6 rounded-lg border-solid border-slate-50 border shadow-2xl flex flex-col justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center">Task manager</h1>  
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Nome</label>
          <Input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div>
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
        <Button type="submit">Registrati</Button>
      </form>
    </div>
  );
}

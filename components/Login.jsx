import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';  // Assicurati che il percorso sia corretto
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCredential.user); // Passa l'oggetto utente al callback
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
    <div className='min-h-[60vh] flex flex-col justify-center items-center'>
      <form onSubmit={handleSubmit} className="space-y-4 m-auto w-fit p-6 rounded-lg border-solid border-slate-50 border shadow-2xl flex flex-col justify-center items-center ">
        <div>
        <h1 className="text-2xl font-bold mb-8">Task manager app</h1> 
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
    </>
  );
}

"use client";

import React, { useState } from 'react';
import { Login } from "@/components/Login"; 
import { SignUp } from "@/components/SignUp"; 
import { Button } from '@/components/ui/button';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (user) => {
    setUser(user); // Aggiorna lo stato utente
  };

  const handleSignUp = (user) => {
    setUser(user); // Aggiorna lo stato utente
  };

  return (
    <div className='min-h-[60vh] flex flex-col justify-center items-center'>
      {user ? (
        <div>Benvenuto, {user.displayName}!</div>
      ) : (
        <>
          {isLogin ? (
            <>
              <Login onLogin={handleLogin} />
              <Button className="text-md" variant="link" onClick={() => setIsLogin(false)}>Registrati ora</Button>
            </>
          ) : (
            <div>
              <SignUp onSignUp={handleSignUp} />
              <p className="text-center">
                Hai già un account?{' '}
                <button onClick={() => setIsLogin(true)}>
                  Accedi
                </button>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

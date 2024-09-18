"use client"

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';  
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Login } from './Login';  
import { SignUp } from './SignUp';
import { ChevronRightIcon } from "@radix-ui/react-icons"  

export function TableDemo() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasksArray = [];
        querySnapshot.forEach((doc) => {
          tasksArray.push({ id: doc.id, ...doc.data() });
        });
        setTasks(tasksArray);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleChange = async (id, field, value) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'tasks', id), { [field]: value });
      } catch (error) {
        console.error("Errore durante l'aggiornamento del task:", error);
      }
    }
  };

  const handleAddTask = async () => {
    if (user) {
      console.log("Aggiungendo un task per l'utente con UID:", user.uid);
      try {
        const docRef = await addDoc(collection(db, 'tasks'), {
          task: '',
          data: new Date().toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          cliente: '',
          ore: '0',
          costo: '25',
          userId: user.uid, // Associa il task all'utente corrente
        });
        console.log("Task aggiunto con ID:", docRef.id);
      } catch (error) {
        console.error("Errore durante l'aggiunta del task:", error);
      }
    } else {
      console.error("Nessun utente autenticato.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (error) {
        console.error("Errore durante l'eliminazione del task:", error);
      }
    }
  };

  const calculateTotal = () => {
    return tasks.reduce((total, task) => total + parseFloat(task.costo), 0).toFixed(2);
  };

  const totalHour = () => {
    return tasks.reduce((total, task) => total + parseFloat(task.ore), 0);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Errore durante il logout", error);
    }
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (!user) {
    return (
      <div className='min-h-[60vh] flex flex-col justify-center items-center'>
        {isLogin ? (
          <>
            <Login onLogin={() => {}} />
            <p>
              Non hai un account?{' '}
              <Button onClick={() => setIsLogin(false)} variant="link">
                Registrati
              </Button>
            </p>
          </>
        ) : (
          <>
            <SignUp onSignUp={() => {}} />
            <p className="mt-4">
              Hai già un account?{' '}
              <Button onClick={() => setIsLogin(true)} variant="link">
                Accedi
              </Button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between gap-5 px-4">
        <h1 className="text-2xl font-bold mb-8">Task manager app</h1>  
        <Button onClick={handleLogout} className="mb-4">Logout<ChevronRightIcon className="h-4 w-4" /></Button>
      </div>
      <Button onClick={handleAddTask} className="mb-4 ml-4 bg-green-800 hover:bg-green-600">Aggiungi Task</Button>
      <Table>
        <TableCaption>Una lista delle task recenti</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Ore</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user ? (
            tasks.map((task) => (
              <TableRow key={task.id}>
                {['task', 'data', 'cliente', 'ore', 'costo'].map((field) => (
                  <TableCell key={field}>
                    <Input
                      value={task[field]}
                      onChange={(e) => handleChange(task.id, field, e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button onClick={() => handleDeleteTask(task.id)} variant="destructive">Elimina</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                {['task', 'data', 'cliente', 'ore', 'costo'].map((field) => (
                  <TableCell key={field}>
                    <Input
                      value={task[field]}
                      onChange={(e) => handleChange(task.id, field, e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button onClick={() => handleDeleteTask(task.id)} variant="destructive">Elimina</Button>
                </TableCell>
              </TableRow>
              ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Totale</TableCell>
            <TableCell colSpan={1}>{totalHour()} ore</TableCell>
            <TableCell colSpan={1}>€{calculateTotal()}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

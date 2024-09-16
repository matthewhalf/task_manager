"use client"

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';  // Assicurati che il percorso sia corretto
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Login } from './Login';  // Assicurati che il percorso sia corretto
import { SignUp } from './SignUp';  // Assicurati che il percorso sia corretto

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
    if (user) {
      const q = query(collection(db, 'tasks'));
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
      try {
        await addDoc(collection(db, 'tasks'), {
          task: 'Nuovo task',
          data: new Date().toISOString().split('T')[0],
          cliente: '',
          ore: '0',
          costo: '0',
        });
      } catch (error) {
        console.error("Errore durante l'aggiunta del task:", error);
      }
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
      <div>
        {isLogin ? (
          <>
            <Login onLogin={() => {}} />
            <p className="mt-4">
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
      <Button onClick={handleLogout} className="mb-4">Logout</Button>
      <Button onClick={handleAddTask} className="mb-4 ml-4">Aggiungi Task</Button>
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
          {tasks.map((task) => (
            <TableRow key={task.id}>
              {['task', 'data', 'cliente', 'ore', 'costo'].map((field) => (
                <TableCell key={field}>
                  <Input
                    value={task[field]}
                    onChange={(e) => handleChange(task.id, field, e.target.value)}
                    className="w-full"
                  />
                  {field === 'ore' && ' ore'}
                  {field === 'costo' && '€'}
                </TableCell>
              ))}
              <TableCell>
                <Button onClick={() => handleDeleteTask(task.id)} variant="destructive">Elimina</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Totale</TableCell>
            <TableCell>€{calculateTotal()}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
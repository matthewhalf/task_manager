"use client"

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';  // Assicurati che il percorso sia corretto
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

const initialTasks = [
  {
    id: 1,
    task: "task esempio",
    data: "09/09/2024",
    cliente: "Rosy",
    ore: "3",
    costo: "25",
  },
  {
    id: 2,
    task: "task esempio 2",
    data: "11/09/2024",
    cliente: "Vivarelli",
    ore: "3",
    costo: "25",
  },
];

export function TableDemo() {
  const [tasks, setTasks] = useState(initialTasks);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (id, field, value) => {
    if (user) {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, [field]: value } : task
      ));
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

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div>
      <Button onClick={handleLogout} className="mb-4">Logout</Button>
      <Table>
        <TableCaption>Una lista delle task recenti</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Ore</TableHead>
            <TableHead>Costo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              {Object.keys(task).filter(key => key !== 'id').map((field) => (
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
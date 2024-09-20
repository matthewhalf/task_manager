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
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { saveAs } from 'file-saver'; // Importazione libreria per salvare CSV

export function TableDemo() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast()

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

  // Funzione per ordinare i task per data
  const sortedTasks = tasks.slice().sort((a, b) => {
    const dateA = new Date(a.data.split('/').reverse().join('-'));
    const dateB = new Date(b.data.split('/').reverse().join('-'));
    return dateA - dateB;
  });

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
          userId: user.uid,
        });
        console.log("Task aggiunto con ID:", docRef.id);
      } catch (error) {
        console.error("Errore durante l'aggiunta del task:", error);
      }
    } else {
      console.error("Nessun utente autenticato.");
    }
  };

  const handleDeleteTask = (id) => {
    if (user) {
      toast({
        title: "Conferma eliminazione",
        description: "Sei sicuro di voler eliminare questo task?",
        action: (
          <div style={{ display: 'flex', gap: '8px' }}>
            <ToastAction
              altText="Elimina"
              onClick={async () => {
                try {
                  await deleteDoc(doc(db, 'tasks', id));
                  toast({
                    title: "Task eliminato",
                    description: "Il task è stato eliminato correttamente.",
                  });
                } catch (error) {
                  console.error("Errore durante l'eliminazione del task:", error);
                  toast({
                    title: "Errore",
                    description: "C'è stato un problema durante l'eliminazione del task.",
                  });
                }
              }}
            >
              Elimina
            </ToastAction>

            <ToastAction
              altText="Annulla"
              onClick={() => {
                toast({
                  title: "Operazione annullata",
                  description: "L'eliminazione del task è stata annullata.",
                });
              }}
            >
              Annulla
            </ToastAction>
          </div>
        ),
      });
    }
  };

  const calculateTotal = () => {
    return tasks.reduce((total, task) => total + parseFloat(task.costo), 0).toFixed(2);
  };

  const totalHour = () => {
    return tasks.reduce((total, task) => total + parseFloat(task.ore), 0);
  };

  // Funzione per esportare i task in formato CSV
  const exportToCSV = () => {
    const headers = ['Task', 'Data', 'Cliente', 'Ore', 'Costo'];
    const rows = tasks.map(task => [task.task, task.data, task.cliente, task.ore, task.costo]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "tasks.csv");
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
      <div className="flex justify-between items-center gap-5 px-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Task manager</h1>
          <p className="text-sm text-gray-600">Benvenuto, {user.displayName || user.email}</p>
        </div>
        <Button onClick={handleLogout}>Logout<ChevronRightIcon className="h-4 w-4 ml-2" /></Button>
      </div>
      <div className="flex gap-4 px-4 mb-4">
        <Button onClick={handleAddTask} className="bg-green-800 hover:bg-green-600">Aggiungi Task</Button>
        <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-400">Esporta CSV</Button>
      </div>
      <Table>
        <TableCaption>Una lista delle task recenti svolte per {user.email === "giulio.cinelli@pianoweb.eu" ? 'Pianoweb' : 'Vivarelli Consulting'}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead onClick={() => setTasks(sortedTasks)}>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Ore</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task, index) => (
            <TableRow key={task.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f5]'}>              {['task', 'data', 'cliente', 'ore', 'costo'].map((field) => (
              <TableCell key={field}>
                <Input
                  value={task[field]}
                  onChange={(e) => handleChange(task.id, field, e.target.value)}
                  className="w-full border-none shadow-none"
                />
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

             

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const TaskContext = createContext(null);

function getStoredTasks() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cf_tasks');
  return stored ? JSON.parse(stored) : [];
}

function saveTasks(tasks) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cf_tasks', JSON.stringify(tasks));
}

function getStoredJournals() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cf_journals');
  return stored ? JSON.parse(stored) : [];
}

function saveJournals(journals) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cf_journals', JSON.stringify(journals));
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: dbTasks }, { data: dbJournals }] = await Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('journals').select('*')
        ]);
        if (dbTasks) {
          // Normalize completedObjectives from potential null
          setTasks(dbTasks.map(t => ({...t, completedObjectives: t.completedObjectives || []})));
        }
        if (dbJournals) setJournals(dbJournals);
      } catch (err) {
        console.error("Supabase load error:", err);
        setTasks(getStoredTasks());
        setJournals(getStoredJournals());
      }
    }
    loadData();
  }, []);

  const createTask = useCallback((taskData) => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      assignedTo: taskData.assignedTo,
      assignedBy: taskData.assignedBy || 'admin',
      business: taskData.business || null,
      businesses: taskData.businesses || [],
      industry: taskData.industry || '',
      location: taskData.location || '',
      title: taskData.title || `${taskData.industry} outreach in ${taskData.location}`,
      objectives: taskData.objectives || [
        `Find complete ${taskData.industry} list in ${taskData.location}`,
        'Get contact numbers for each business',
        'Identify common pain points they face',
        'Generate and practice call script',
        'Make at least 5 calls',
      ],
      completedObjectives: [],
      status: 'pending', // pending, in-progress, completed
      priority: taskData.priority || 'medium',
      notes: [],
      callLog: [],
      painPoints: taskData.painPoints || null,
      script: taskData.script || null,
      createdAt: new Date().toISOString(),
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
    };
    
    setTasks(prev => [...prev, newTask]);
    supabase.from('tasks').insert([newTask]).then(({error}) => {
      if (error) console.error("Error creating task:", error);
    });
    
    return newTask;
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    supabase.from('tasks').update(updates).eq('id', taskId).then();
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    supabase.from('tasks').delete().eq('id', taskId).then();
  }, []);

  const toggleObjective = useCallback((taskId, objectiveIndex) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      const completed = [...(task.completedObjectives || [])];
      const idx = completed.indexOf(objectiveIndex);
      if (idx >= 0) completed.splice(idx, 1);
      else completed.push(objectiveIndex);
      
      const updatedTask = { ...task, completedObjectives: completed };
      supabase.from('tasks').update({ completedObjectives: completed }).eq('id', taskId).then();
      
      return prev.map(t => t.id === taskId ? updatedTask : t);
    });
  }, []);

  const addCallLog = useCallback((taskId, logEntry) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      const callLog = [...(task.callLog || []), {
        id: `call-${Date.now()}`,
        businessName: logEntry.businessName,
        phone: logEntry.phone,
        outcome: logEntry.outcome,
        notes: logEntry.notes || '',
        calledAt: new Date().toISOString(),
      }];
      
      const updatedTask = { ...task, callLog };
      supabase.from('tasks').update({ callLog }).eq('id', taskId).then();
      
      return prev.map(t => t.id === taskId ? updatedTask : t);
    });
  }, []);

  const addNote = useCallback((taskId, note) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      const notes = [...(task.notes || []), {
        id: `note-${Date.now()}`,
        text: note,
        createdAt: new Date().toISOString(),
      }];
      
      const updatedTask = { ...task, notes };
      supabase.from('tasks').update({ notes }).eq('id', taskId).then();
      
      return prev.map(t => t.id === taskId ? updatedTask : t);
    });
  }, []);

  const getTasksForUser = useCallback((userId) => {
    return tasks.filter(t => t.assignedTo === userId);
  }, [tasks]);

  const getTasksForToday = useCallback((userId) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.assignedTo === userId && t.dueDate === today);
  }, [tasks]);

  const getAllTasks = useCallback(() => { return tasks; }, [tasks]);

  const assignBusinesses = useCallback((taskId, businesses) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, businesses } : t));
    supabase.from('tasks').update({ businesses }).eq('id', taskId).then();
  }, []);

  const addJournalEntry = useCallback((userId, text) => {
    const newEntry = {
      id: `journal-${Date.now()}`,
      userId,
      text,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };
    
    setJournals(prev => [...prev, newEntry]);
    supabase.from('journals').insert([newEntry]).then();
    
    return newEntry;
  }, []);

  const getAllJournals = useCallback(() => { return journals; }, [journals]);

  return (
    <TaskContext.Provider value={{
      tasks,
      createTask,
      updateTask,
      deleteTask,
      toggleObjective,
      addCallLog,
      addNote,
      getTasksForUser,
      getTasksForToday,
      getAllTasks,
      assignBusinesses,
      journals,
      addJournalEntry,
      getAllJournals,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
}

export default TaskContext;

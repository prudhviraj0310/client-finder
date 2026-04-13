'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    setTasks(getStoredTasks());
    setJournals(getStoredJournals());
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
    const updated = [...getStoredTasks(), newTask];
    saveTasks(updated);
    setTasks(updated);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    const allTasks = getStoredTasks();
    const updated = allTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    saveTasks(updated);
    setTasks(updated);
  }, []);

  const deleteTask = useCallback((taskId) => {
    const allTasks = getStoredTasks();
    const updated = allTasks.filter(t => t.id !== taskId);
    saveTasks(updated);
    setTasks(updated);
  }, []);

  const toggleObjective = useCallback((taskId, objectiveIndex) => {
    const allTasks = getStoredTasks();
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const completed = [...(task.completedObjectives || [])];
    const idx = completed.indexOf(objectiveIndex);
    if (idx >= 0) {
      completed.splice(idx, 1);
    } else {
      completed.push(objectiveIndex);
    }
    
    const updated = allTasks.map(t => t.id === taskId ? { ...t, completedObjectives: completed } : t);
    saveTasks(updated);
    setTasks(updated);
  }, []);

  const addCallLog = useCallback((taskId, logEntry) => {
    const allTasks = getStoredTasks();
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const callLog = [...(task.callLog || []), {
      id: `call-${Date.now()}`,
      businessName: logEntry.businessName,
      phone: logEntry.phone,
      outcome: logEntry.outcome, // 'answered', 'no-answer', 'callback', 'interested', 'rejected'
      notes: logEntry.notes || '',
      calledAt: new Date().toISOString(),
    }];
    
    const updated = allTasks.map(t => t.id === taskId ? { ...t, callLog } : t);
    saveTasks(updated);
    setTasks(updated);
  }, []);

  const addNote = useCallback((taskId, note) => {
    const allTasks = getStoredTasks();
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const notes = [...(task.notes || []), {
      id: `note-${Date.now()}`,
      text: note,
      createdAt: new Date().toISOString(),
    }];
    
    const updated = allTasks.map(t => t.id === taskId ? { ...t, notes } : t);
    saveTasks(updated);
    setTasks(updated);
  }, []);

  const getTasksForUser = useCallback((userId) => {
    return getStoredTasks().filter(t => t.assignedTo === userId);
  }, []);

  const getTasksForToday = useCallback((userId) => {
    const today = new Date().toISOString().split('T')[0];
    return getStoredTasks().filter(t => t.assignedTo === userId && t.dueDate === today);
  }, []);

  const getAllTasks = useCallback(() => {
    return getStoredTasks();
  }, []);

  const assignBusinesses = useCallback((taskId, businesses) => {
    const allTasks = getStoredTasks();
    const updated = allTasks.map(t => t.id === taskId ? { ...t, businesses } : t);
    saveTasks(updated);
    setTasks(updated);
  }, []);

  const addJournalEntry = useCallback((userId, text) => {
    const newEntry = {
      id: `journal-${Date.now()}`,
      userId,
      text,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [...getStoredJournals(), newEntry];
    saveJournals(updated);
    setJournals(updated);
    return newEntry;
  }, []);

  const getAllJournals = useCallback(() => {
    return getStoredJournals();
  }, []);

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

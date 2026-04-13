'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

const DEFAULT_ADMIN = {
  id: 'admin',
  username: 'admin',
  password: 'admin123',
  name: 'Prudhviraj',
  role: 'admin',
  avatar: '👑',
  createdAt: new Date().toISOString(),
};

const DEFAULT_MEMBERS = [
  { id: 'imran', username: 'imran', password: 'member123', name: 'Imran', role: 'second-head', avatar: '👨‍💼', createdAt: new Date().toISOString() },
  { id: 'adharash', username: 'adharash', password: 'member123', name: 'Adharash', role: 'caller', avatar: '🧑‍💻', createdAt: new Date().toISOString() },
  { id: 'shahid', username: 'shahid', password: 'member123', name: 'Shahid', role: 'caller', avatar: '🧑‍🚀', createdAt: new Date().toISOString() },
];

function getStoredUsers() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('cf_users');
  let users = stored ? JSON.parse(stored) : [DEFAULT_ADMIN, ...DEFAULT_MEMBERS];
  
  // Migration: If the new 'imran' ID isn't in local storage, assume we need to upgrade the defaults.
  // This helps apply the changes to the user's local instance immediately without cache clearing.
  if (!users.some(u => u.id === 'imran')) {
    // Retain only those who aren't the generic member defaults, plus add the real team
    users = users.filter(u => u.id === 'admin' || (!u.id.startsWith('member-') && !u.id.match(/^member[0-9]+$/)));
    users = [...users, ...DEFAULT_MEMBERS];
    
    // Ensure admin is still there
    if (!users.some(u => u.id === 'admin')) users.unshift(DEFAULT_ADMIN);
    
    localStorage.setItem('cf_users', JSON.stringify(users));
  }
  
  if (!stored) localStorage.setItem('cf_users', JSON.stringify(users));
  return users;
}

function getStoredSession() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('cf_session');
  return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: dbUsers, error } = await supabase.from('users').select('*');
        if (error) throw error;
        
        if (dbUsers && dbUsers.length > 0) {
          // Normalize created_at mapping
          const mappedUsers = dbUsers.map(u => ({ ...u, createdAt: u.created_at || u.createdAt }));
          setUsers(mappedUsers);
          
          const session = getStoredSession();
          if (session) {
            const user = mappedUsers.find(u => u.id === session.userId);
            if (user) setCurrentUser(user);
          }
        } else {
          // Auto-seed if database is completely empty
          const seedUsers = [DEFAULT_ADMIN, ...DEFAULT_MEMBERS].map(u => ({
            id: u.id, username: u.username, password: u.password, 
            name: u.name, role: u.role, avatar: u.avatar
          }));
          await supabase.from('users').insert(seedUsers);
          setUsers([DEFAULT_ADMIN, ...DEFAULT_MEMBERS]);
        }
      } catch (err) {
        console.error("Supabase load error:", err);
        // Fallback to local storage if DB fails
        const local = getStoredUsers();
        if (local) setUsers(local);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const login = useCallback((username, password) => {
    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();
    
    // Add debug logs to surface to browser console in production!
    console.log("Login Attempt:", cleanUsername, cleanPassword);
    console.log("Current Registered Users State:", users);

    const user = users.find(u => u.username === cleanUsername && u.password === cleanPassword);
    if (!user) {
      console.error("Login verification failed. No matching user found in state!");
      return { success: false, error: 'Invalid username or password' };
    }
    
    setCurrentUser(user);
    localStorage.setItem('cf_session', JSON.stringify({ userId: user.id, loginAt: new Date().toISOString() }));
    return { success: true, user };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('cf_session');
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const addMember = useCallback((memberData) => {
    const newMember = {
      id: `member-${Date.now()}`,
      username: memberData.username,
      password: memberData.password || 'member123',
      name: memberData.name,
      role: memberData.role || 'caller',
      avatar: memberData.avatar || '🧑‍💼',
    };
    
    // Optimistic Update
    setUsers(prev => [...prev, { ...newMember, createdAt: new Date().toISOString() }]);
    
    // Sync to Supabase
    supabase.from('users').insert([newMember]).then(({error}) => {
      if (error) console.error("Error adding member:", error);
    });
    
    return newMember;
  }, []);

  const updateMember = useCallback((memberId, updates) => {
    // Optimistic Update
    setUsers(prev => prev.map(u => u.id === memberId ? { ...u, ...updates } : u));
    
    // Sync to Supabase
    supabase.from('users').update(updates).eq('id', memberId).then(({error}) => {
      if (error) console.error("Error updating member:", error);
    });

    if (currentUser?.id === memberId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  }, [currentUser]);

  const deleteMember = useCallback((memberId) => {
    // Optimistic Update
    setUsers(prev => prev.filter(u => u.id !== memberId));
    
    // Sync to Supabase
    supabase.from('users').delete().eq('id', memberId).then(({error}) => {
      if (error) console.error("Error deleting member:", error);
    });
  }, []);

  const getTeamMembers = useCallback(() => {
    return users.filter(u => u.role !== 'admin');
  }, [users]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loading,
      isAdmin,
      login,
      logout,
      addMember,
      updateMember,
      deleteMember,
      getTeamMembers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;

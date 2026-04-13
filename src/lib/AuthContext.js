'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  { id: 'member-1', username: 'member1', password: 'member123', name: 'Team Member 1', role: 'caller', avatar: '🧑‍💼', createdAt: new Date().toISOString() },
  { id: 'member-2', username: 'member2', password: 'member123', name: 'Team Member 2', role: 'scanner', avatar: '👨‍💻', createdAt: new Date().toISOString() },
  { id: 'member-3', username: 'member3', password: 'member123', name: 'Team Member 3', role: 'caller', avatar: '👩‍💼', createdAt: new Date().toISOString() },
  { id: 'member-4', username: 'member4', password: 'member123', name: 'Team Member 4', role: 'closer', avatar: '🧑‍🚀', createdAt: new Date().toISOString() },
];

function getStoredUsers() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('cf_users');
  if (stored) return JSON.parse(stored);
  // Initialize with defaults
  const users = [DEFAULT_ADMIN, ...DEFAULT_MEMBERS];
  localStorage.setItem('cf_users', JSON.stringify(users));
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
    const storedUsers = getStoredUsers();
    if (storedUsers) setUsers(storedUsers);
    const session = getStoredSession();
    if (session && storedUsers) {
      const user = storedUsers.find(u => u.id === session.userId);
      if (user) setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    const allUsers = getStoredUsers() || [];
    const user = allUsers.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, error: 'Invalid username or password' };
    
    setCurrentUser(user);
    localStorage.setItem('cf_session', JSON.stringify({ userId: user.id, loginAt: new Date().toISOString() }));
    return { success: true, user };
  }, []);

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
      createdAt: new Date().toISOString(),
    };
    const updated = [...(getStoredUsers() || []), newMember];
    localStorage.setItem('cf_users', JSON.stringify(updated));
    setUsers(updated);
    return newMember;
  }, []);

  const updateMember = useCallback((memberId, updates) => {
    const allUsers = getStoredUsers() || [];
    const updated = allUsers.map(u => u.id === memberId ? { ...u, ...updates } : u);
    localStorage.setItem('cf_users', JSON.stringify(updated));
    setUsers(updated);
  }, []);

  const deleteMember = useCallback((memberId) => {
    const allUsers = getStoredUsers() || [];
    const updated = allUsers.filter(u => u.id !== memberId);
    localStorage.setItem('cf_users', JSON.stringify(updated));
    setUsers(updated);
  }, []);

  const getTeamMembers = useCallback(() => {
    return (getStoredUsers() || []).filter(u => u.role !== 'admin');
  }, []);

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

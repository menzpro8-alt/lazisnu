'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiPost, apiGet } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('lazisnu_token');
    const savedUser = localStorage.getItem('lazisnu_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('lazisnu_token');
        localStorage.removeItem('lazisnu_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await apiPost('auth/login', { username, password });
    localStorage.setItem('lazisnu_token', res.data.token);
    localStorage.setItem('lazisnu_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lazisnu_token');
    localStorage.removeItem('lazisnu_user');
    setUser(null);
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiGet('auth/me');
      localStorage.setItem('lazisnu_user', JSON.stringify(res.data));
      setUser(res.data);
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, mounted, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

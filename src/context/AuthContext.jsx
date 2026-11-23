import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, logoutAuditor as clearSession } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


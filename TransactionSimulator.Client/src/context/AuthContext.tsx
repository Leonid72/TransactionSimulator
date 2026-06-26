import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthData } from '../types';

interface AuthContextValue {
  authData: AuthData | null;
  isAuthenticated: boolean;
  signIn: (data: AuthData) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AuthData | null>(() => {
    const token = localStorage.getItem('accessToken');
    const email = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    if (token && email && userId) {
      return { accessToken: token, email, userId, expiresAtUtc: '' };
    }
    return null;
  });

  const signIn = (data: AuthData) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userId', data.userId);
    setAuthData(data);
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setAuthData(null);
  };

  return (
    <AuthContext.Provider value={{ authData, isAuthenticated: !!authData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

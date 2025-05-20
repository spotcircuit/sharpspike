
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, createDevAccount as authCreateDevAccount } from './authFunctions';
import { checkAdminStatus } from './adminUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            checkAdminStatus(currentSession.user.id, currentSession.user.email)
              .then(adminStatus => setIsAdmin(adminStatus));
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        checkAdminStatus(currentSession.user.id, currentSession.user.email)
          .then(adminStatus => setIsAdmin(adminStatus));
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password);
    navigate('/');
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    await authSignUp(email, password, fullName);
  };

  const signOut = async () => {
    await authSignOut();
    navigate('/auth');
  };

  const createDevAccount = async () => {
    await authCreateDevAccount(setIsAdmin);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        createDevAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  createDevAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of admin emails that should always have admin privileges
const ADMIN_EMAILS = [
  'developer@test.com',
  'jeffgus@gmail.com'
];

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
            checkAdminStatus(currentSession.user.id, currentSession.user.email);
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
        checkAdminStatus(currentSession.user.id, currentSession.user.email);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string, email?: string | null) => {
    try {
      // First check if email is in the ADMIN_EMAILS list
      if (email && ADMIN_EMAILS.includes(email)) {
        // Update the database to ensure the profile has admin privileges
        await ensureAdminPrivileges(userId);
        setIsAdmin(true);
        return;
      }

      // Otherwise check the database as before
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error in admin check:', error);
      setIsAdmin(false);
    }
  };

  // Helper function to ensure the user has admin privileges in the database
  const ensureAdminPrivileges = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating admin privileges:', error);
      }
    } catch (error) {
      console.error('Error ensuring admin privileges:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed in successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed up successfully. Please check your email for verification.');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const createDevAccount = async () => {
    try {
      const devEmail = "developer@test.com";
      const devPassword = "developer123";
      const devName = "Test Developer";

      toast.info('Attempting developer login...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword
      });

      if (signInData?.user) {
        toast.success('Developer account login successful');
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', signInData.user.id)
          .single();

        if (profileData && !profileData.is_admin) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', signInData.user.id);
            
          if (updateError) {
            console.error('Error setting admin privileges:', updateError);
            toast.error('Failed to set admin privileges, but login successful');
          } else {
            toast.success('Admin privileges granted');
          }
        }
        
        navigate('/');
        return;
      }
      
      if (signInError) {
        toast.info('Creating developer account...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: devEmail,
          password: devPassword,
          options: {
            data: {
              full_name: devName,
            },
          },
        });
        
        if (signUpError) {
          toast.error(signUpError.message);
          throw signUpError;
        }
        
        if (!signUpData.user) {
          toast.error('Failed to create developer account');
          return;
        }
        
        toast.info('Setting up developer account...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: newLoginData, error: newLoginError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword
        });
        
        if (newLoginError) {
          toast.error(newLoginError.message);
          throw newLoginError;
        }
        
        if (newLoginData.user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', newLoginData.user.id);
            
          if (updateError) {
            toast.error('Failed to set admin privileges, but login successful');
            throw updateError;
          }
          
          toast.success('Developer account created and logged in with admin privileges');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Developer login error:', error);
      toast.error('Failed to create/login as developer');
    }
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


import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple p-6 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-betting-darkPurple/50 backdrop-blur-sm">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-betting-vividPurple/20 data-[state=active]:text-white text-gray-200"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-betting-vividPurple/20 data-[state=active]:text-white text-gray-200"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;

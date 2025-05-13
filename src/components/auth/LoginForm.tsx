
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Code } from 'lucide-react';

const LoginForm = () => {
  const { signIn, createDevAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      await createDevAccount();
    } catch (error) {
      console.error('Dev login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md">
      <CardHeader className="bg-betting-darkPurple">
        <CardTitle className="text-white">Sign In</CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginEmail" className="text-gray-200">Email</Label>
            <Input
              id="loginEmail"
              type="email"
              placeholder="your.email@example.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="bg-white/10 text-white border-white/20 placeholder:text-gray-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loginPassword" className="text-gray-200">Password</Label>
            <Input
              id="loginPassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="bg-white/10 text-white border-white/20"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-900 hover:from-purple-900 hover:to-orange-500 text-white"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleDevLogin}
            className="w-full border-betting-secondaryPurple/50 text-orange-400 flex items-center gap-2"
          >
            <Code size={16} />
            {isLoading ? "Creating Developer Account..." : "Developer Test Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;

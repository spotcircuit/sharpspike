
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const SignupForm = () => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword) {
      toast.error('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupFullName);
      setSignupEmail('');
      setSignupPassword('');
      setSignupFullName('');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md">
      <CardHeader className="bg-betting-darkPurple">
        <CardTitle className="text-white">Create Account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-200">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={signupFullName}
              onChange={(e) => setSignupFullName(e.target.value)}
              className="bg-white/10 text-white border-white/20 placeholder:text-gray-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signupEmail" className="text-gray-200">Email</Label>
            <Input
              id="signupEmail"
              type="email"
              placeholder="your.email@example.com"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="bg-white/10 text-white border-white/20 placeholder:text-gray-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signupPassword" className="text-gray-200">Password</Label>
            <Input
              id="signupPassword"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="bg-white/10 text-white border-white/20"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-900 hover:from-purple-900 hover:to-orange-500 text-white"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignupForm;

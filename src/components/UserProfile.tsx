
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/AuthContext';
import { User, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const UserProfile = () => {
  const { user, signOut, isAdmin } = useAuth();
  
  if (!user) return null;
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:block">
        <p className="text-sm text-gray-300">
          {user.email}
          {isAdmin && <span className="ml-2 text-xs bg-betting-vividPurple px-2 py-0.5 rounded">Admin</span>}
        </p>
        {isAdmin && <p className="text-xs text-betting-vividPurple">Admin access enabled</p>}
      </div>
      <Button 
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="text-gray-300 bg-betting-darkPurple/80 border-betting-secondaryPurple hover:bg-betting-darkPurple"
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span className="hidden md:inline">Sign Out</span>
      </Button>
    </div>
  );
};

export default UserProfile;

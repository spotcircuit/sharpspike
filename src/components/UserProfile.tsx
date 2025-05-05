
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut, isAdmin } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:block">
        <p className="text-sm text-gray-300">
          {user.email}
          {isAdmin && <span className="ml-2 text-xs bg-betting-vividPurple px-2 py-0.5 rounded">Admin</span>}
        </p>
      </div>
      <Button 
        variant="outline"
        size="sm"
        onClick={() => signOut()}
        className="text-gray-300 bg-betting-darkPurple/80 border-betting-secondaryPurple hover:bg-betting-darkPurple"
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span className="hidden md:inline">Sign Out</span>
      </Button>
    </div>
  );
};

export default UserProfile;

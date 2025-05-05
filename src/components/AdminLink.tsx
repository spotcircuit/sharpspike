
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const AdminLink = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const handleAdminClick = () => {
    try {
      console.log("Admin button clicked, navigating to /admin");
      if (isAdmin) {
        navigate('/admin');
      } else {
        console.log("User is not an admin, cannot access admin page");
        toast.error("You need admin privileges to access this page");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate to admin page");
    }
  };

  // Don't show the button if user is not an admin
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleAdminClick}
        className="bg-betting-darkPurple/80 border-betting-secondaryPurple hover:bg-betting-darkPurple text-gray-300"
      >
        <Settings className="mr-2 h-4 w-4" />
        Admin
      </Button>
    </div>
  );
};

export default AdminLink;

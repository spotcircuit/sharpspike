
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const AdminLink = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link to="/admin">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-betting-darkPurple/80 border-betting-secondaryPurple hover:bg-betting-darkPurple text-gray-300"
        >
          <Settings className="mr-2 h-4 w-4" />
          Admin
        </Button>
      </Link>
    </div>
  );
};

export default AdminLink;

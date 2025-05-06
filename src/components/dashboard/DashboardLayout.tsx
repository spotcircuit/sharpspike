
import React from 'react';
import AdminLink from '../AdminLink';
import UserProfile from '../UserProfile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  subtitle 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-4 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center p-4 bg-betting-darkPurple border-4 border-betting-tertiaryPurple rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600">
              {title}
            </h1>
            <p className="text-gray-400">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/quantum-rankings')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              Quantum 5D Rankings
            </Button>
            <UserProfile />
          </div>
        </header>
        
        {children}
      </div>
      
      <AdminLink />
    </div>
  );
};

export default DashboardLayout;

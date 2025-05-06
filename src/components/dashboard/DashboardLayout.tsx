
import React from 'react';
import AdminLink from '../AdminLink';
import UserProfile from '../UserProfile';

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
  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-4 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center p-4 bg-betting-darkPurple border-4 border-betting-secondaryPurple rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600">
              {title}
            </h1>
            <p className="text-gray-400">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UserProfile />
            <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-betting-navyBlue to-betting-darkPurple">
              Trackside Odds Pulse
            </h2>
          </div>
        </header>
        
        {children}
      </div>
      
      <AdminLink />
    </div>
  );
};

export default DashboardLayout;

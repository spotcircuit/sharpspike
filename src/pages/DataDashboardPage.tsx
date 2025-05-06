
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LineChart, BarChartIcon, Database } from 'lucide-react';
import AdminLink from '@/components/AdminLink';
import UserProfile from '@/components/UserProfile';
import ScraperDataDashboard from '@/components/dashboard/ScraperDataDashboard';

const DataDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center p-4 bg-betting-darkPurple border-4 border-betting-tertiaryPurple rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-blue-600">
              5D ODDS PULSE
            </h1>
            <p className="text-gray-400">
              Real-time odds, exotic bet payouts, and race results scraped from offtrackbetting.com
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
            >
              <LineChart className="h-4 w-4" />
              Odds Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/results/all")}
              className="flex items-center gap-2 border-betting-tertiaryPurple bg-betting-darkPurple hover:bg-betting-tertiaryPurple/20"
            >
              <Database className="h-4 w-4" />
              Race Results
            </Button>
            <Button
              onClick={() => navigate('/quantum-rankings')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transform hover:scale-105 transition-all shadow-lg border-2 border-orange-400"
            >
              Quantum 5D AI Rankings
            </Button>
            <UserProfile />
          </div>
        </header>

        <main>
          <ScraperDataDashboard />
        </main>
      </div>
      <AdminLink />
    </div>
  );
};

export default DataDashboardPage;

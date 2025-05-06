
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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">
              5D ODDS PULSE
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <LineChart className="h-4 w-4" />
                Odds Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/results/all")}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Race Results
              </Button>
              <UserProfile />
            </div>
          </div>
          <p className="text-orange-500 mt-2 font-bold">
            Real-time odds, exotic bet payouts, and race results scraped from offtrackbetting.com
          </p>
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

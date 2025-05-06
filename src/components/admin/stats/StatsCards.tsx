
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, Play, Clock } from 'lucide-react';
import { ScraperStats } from '@/types/ScraperTypes';

interface StatsCardsProps {
  stats: ScraperStats;
  isLoading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Jobs</p>
            <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Active Jobs</p>
            <h3 className="text-2xl font-bold">{stats.activeJobs}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Play className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Records</p>
            <h3 className="text-2xl font-bold">
              {stats.oddsRecords + stats.willPaysRecords + stats.resultsRecords}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-betting-darkCard border-betting-mediumBlue">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Last Execution</p>
            <h3 className="text-lg font-medium">
              {stats.lastExecutionTime 
                ? new Date(stats.lastExecutionTime).toLocaleString()
                : 'Never'}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;

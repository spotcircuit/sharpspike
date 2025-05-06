
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

const EmptyStatePrompt: React.FC = () => {
  return (
    <Card className="bg-betting-darkCard border-betting-secondaryPurple">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <BarChart2 className="h-16 w-16 text-gray-400 mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">Select a Track and Race</h3>
        <p className="text-gray-400 max-w-lg">
          Choose a track and race number to view real-time odds, will pays for exotic bets, and race results scraped from offtrackbetting.com.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyStatePrompt;

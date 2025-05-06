
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2, Zap } from 'lucide-react';
import { OddsData, ExoticWillPay } from '@/types/ScraperTypes';
import { RaceResult } from '@/types/RaceResultTypes';
import OddsDisplay from './OddsDisplay';
import WillPaysDisplay from './WillPaysDisplay';
import ResultsDisplay from './ResultsDisplay';

interface DataDisplaySectionProps {
  selectedTrack: string;
  selectedRace: number | null;
  oddsData: OddsData[];
  willPays: ExoticWillPay[];
  results: RaceResult[];
  isLoading: boolean;
}

const DataDisplaySection: React.FC<DataDisplaySectionProps> = ({
  selectedTrack,
  selectedRace,
  oddsData,
  willPays,
  results,
  isLoading
}) => {
  if (!selectedTrack || selectedRace === null) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-6">
        <Card className="bg-betting-darkPurple border-betting-tertiaryPurple border-4">
          <CardHeader className="bg-purple-header">
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart2 className="h-5 w-5 text-blue-400" />
              {selectedTrack} - Race {selectedRace} Current Odds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OddsDisplay 
              oddsData={oddsData} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-6 space-y-6">
        <Card className="bg-betting-darkPurple border-betting-tertiaryPurple border-4">
          <CardHeader className="bg-purple-header">
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              {results.length > 0 ? `${selectedTrack} - Race ${selectedRace} Results` : `${selectedTrack} - Race ${selectedRace} Will Pays`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <ResultsDisplay 
                results={results} 
                isLoading={isLoading} 
              />
            ) : (
              <WillPaysDisplay 
                willPays={willPays} 
                isLoading={isLoading} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataDisplaySection;

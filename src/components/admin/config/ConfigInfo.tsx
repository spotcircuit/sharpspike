
import React from 'react';
import { Card } from '@/components/ui/card';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';
import { AlertTriangle, CheckCircle2, HelpCircle, InfoIcon } from 'lucide-react';

interface ConfigInfoProps {
  apiUrl: string;
  setApiUrl: React.Dispatch<React.SetStateAction<string>>;
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  isTestMode: boolean;
  setIsTestMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfigInfo: React.FC<ConfigInfoProps> = ({ 
  apiUrl, 
  setApiUrl, 
  apiKey, 
  setApiKey, 
  isTestMode, 
  setIsTestMode 
}) => {
  return (
    <Card className="bg-betting-darkCard border-betting-mediumBlue p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <InfoIcon className="h-5 w-5 mr-2 text-blue-400" />
        Scraper Configuration
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-400 mb-2 flex items-center">
            <span className="h-7 w-7 flex items-center justify-center bg-blue-500/20 rounded-full mr-2">1</span>
            URL Patterns
          </h4>
          <div className="text-sm text-gray-400 space-y-2">
            <p>Use these URL patterns for different types of scrapers:</p>
            
            <div className="bg-black/30 p-2 rounded">
              <strong>Odds:</strong> https://www.offtrackbetting.com/[track-name]/race-[number]
            </div>
            
            <div className="bg-black/30 p-2 rounded">
              <strong>Will Pays:</strong> https://www.offtrackbetting.com/[track-name]/race-[number]/will-pays
            </div>
            
            <div className="bg-black/30 p-2 rounded">
              <strong>Results:</strong> https://www.offtrackbetting.com/[track-name]/race-[number]/results
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-green-400 mb-2 flex items-center">
            <span className="h-7 w-7 flex items-center justify-center bg-green-500/20 rounded-full mr-2">2</span>
            Job Types
          </h4>
          <div className="text-sm text-gray-400">
            <p>The scraper supports three types of jobs:</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong className="text-green-400">Odds:</strong> 
                  <p>Scrapes current win/place/show odds for each horse in a race. Updates frequently.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong className="text-green-400">Will Pays:</strong> 
                  <p>Scrapes exotic bet payouts (Daily Double, Pick 3, Pick 4, Pick 5, Pick 6) and displays potential payout amounts.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <strong className="text-green-400">Results:</strong> 
                  <p>Scrapes race results, order of finish, and final payout amounts after a race has concluded.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-yellow-400 mb-2 flex items-center">
            <span className="h-7 w-7 flex items-center justify-center bg-yellow-500/20 rounded-full mr-2">3</span>
            Intervals & Monitoring
          </h4>
          <div className="text-sm text-gray-400">
            <p>Jobs can be scheduled with different intervals ranging from 30 seconds to 1 hour.</p>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-start">
                <HelpCircle className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                <p><strong>Odds:</strong> Recommend 30-60 second intervals as odds change frequently</p>
              </div>
              <div className="flex items-start">
                <HelpCircle className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                <p><strong>Will Pays:</strong> Recommend 2-5 minute intervals as these update less frequently</p>
              </div>
              <div className="flex items-start">
                <HelpCircle className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                <p><strong>Results:</strong> Recommend 10-30 minute intervals as these only become available after race completion</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 border border-yellow-500/30 rounded-md bg-yellow-500/10">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-400">Monitoring Tips</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check the <span className="text-yellow-400">Live Data Stream</span> panel to confirm data is being scraped correctly</li>
                    <li>View the progress bar to see when the next job run is scheduled</li>
                    <li>Use the manual run button to trigger immediate scrapes</li>
                    <li>Job status colors indicate the current state of each job</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-purple-400 mb-2 flex items-center">
            <span className="h-7 w-7 flex items-center justify-center bg-purple-500/20 rounded-full mr-2">4</span>
            Supported Tracks
          </h4>
          <div className="text-sm text-gray-400">
            <p>The following tracks are currently supported:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {TRACK_OPTIONS.map(track => (
                <div key={track.value} className="bg-black/30 p-2 rounded flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                  {track.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConfigInfo;

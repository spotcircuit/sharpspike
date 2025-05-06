
import React from 'react';
import { Card } from '@/components/ui/card';
import { TRACK_OPTIONS } from '@/types/ScraperTypes';

const ConfigInfo: React.FC = () => {
  return (
    <Card className="bg-betting-darkCard border-betting-mediumBlue p-4">
      <h3 className="text-lg font-medium mb-4">Scraper Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-400 mb-2">URL Patterns</h4>
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
          <h4 className="font-medium text-green-400 mb-2">Job Types</h4>
          <div className="text-sm text-gray-400">
            <p>The scraper supports three types of jobs:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Odds:</strong> Scrapes current odds for each horse in a race</li>
              <li><strong>Will Pays:</strong> Scrapes exotic bet payouts (DD, P3, P4, P5, P6)</li>
              <li><strong>Results:</strong> Scrapes race results and payouts</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-yellow-400 mb-2">Intervals</h4>
          <div className="text-sm text-gray-400">
            <p>Jobs can be scheduled with different intervals ranging from 30 seconds to 1 hour.</p>
            <p className="mt-2">Choose shorter intervals (30-60 seconds) for odds that change frequently, and longer intervals for will pays and results.</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-purple-400 mb-2">Supported Tracks</h4>
          <div className="text-sm text-gray-400">
            <p>The following tracks are currently supported:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {TRACK_OPTIONS.map(track => (
                <div key={track.value} className="bg-black/30 p-2 rounded">
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

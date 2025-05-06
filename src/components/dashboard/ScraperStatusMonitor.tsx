
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { RefreshCw, Database, AlertCircle, FileText } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface DataStat {
  tableName: string;
  totalCount: number;
  recentCount: number;
  lastUpdate: string | null;
}

const ScraperStatusMonitor: React.FC = () => {
  const [stats, setStats] = useState<DataStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load stats on mount and every 30 seconds
  useEffect(() => {
    loadStats();
    
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to load database stats
  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Get current time for "recent" threshold (past hour)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      // Get odds data stats
      const [
        oddsTotal,
        oddsRecent,
        willPaysTotal,
        willPaysRecent,
        resultsTotal,
        resultsRecent,
      ] = await Promise.all([
        supabase.from('odds_data').select('id', { count: 'exact', head: true }),
        supabase.from('odds_data').select('id', { count: 'exact', head: true })
          .gte('scraped_at', oneHourAgo.toISOString()),
        supabase.from('exotic_will_pays').select('id', { count: 'exact', head: true }),
        supabase.from('exotic_will_pays').select('id', { count: 'exact', head: true })
          .gte('scraped_at', oneHourAgo.toISOString()),
        supabase.from('race_results').select('id', { count: 'exact', head: true }),
        supabase.from('race_results').select('id', { count: 'exact', head: true })
          .gte('created_at', oneHourAgo.toISOString()),
      ]);
      
      // Get latest updates from each table
      const [
        latestOdds,
        latestWillPays,
        latestResults,
      ] = await Promise.all([
        supabase.from('odds_data').select('scraped_at')
          .order('scraped_at', { ascending: false }).limit(1).single(),
        supabase.from('exotic_will_pays').select('scraped_at')
          .order('scraped_at', { ascending: false }).limit(1).single(),
        supabase.from('race_results').select('created_at')
          .order('created_at', { ascending: false }).limit(1).single(),
      ]);
      
      setStats([
        {
          tableName: 'Odds Data',
          totalCount: oddsTotal.count || 0,
          recentCount: oddsRecent.count || 0,
          lastUpdate: latestOdds.data?.scraped_at || null,
        },
        {
          tableName: 'Will Pays',
          totalCount: willPaysTotal.count || 0,
          recentCount: willPaysRecent.count || 0,
          lastUpdate: latestWillPays.data?.scraped_at || null,
        },
        {
          tableName: 'Race Results',
          totalCount: resultsTotal.count || 0,
          recentCount: resultsRecent.count || 0,
          lastUpdate: latestResults.data?.created_at || null,
        },
      ]);
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load database statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh stats
  const handleRefresh = () => {
    loadStats();
    toast.success('Database statistics refreshed');
  };

  return (
    <Card className="bg-betting-darkCard border-betting-mediumBlue">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-betting-skyBlue" />
            <span>Scraper Database Status</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              Last updated: {format(lastRefresh, 'HH:mm:ss')}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <p>Loading database statistics...</p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Total Records</TableHead>
                  <TableHead>Recent Records (1h)</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => {
                  const isActive = stat.recentCount > 0;
                  const lastUpdateDate = stat.lastUpdate 
                    ? new Date(stat.lastUpdate) 
                    : null;
                  const isRecent = lastUpdateDate 
                    ? (new Date().getTime() - lastUpdateDate.getTime()) < 3600000 // 1 hour
                    : false;
                  
                  return (
                    <TableRow key={stat.tableName}>
                      <TableCell className="font-medium">{stat.tableName}</TableCell>
                      <TableCell>{stat.totalCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "success" : "secondary"}>
                          {stat.recentCount.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {stat.lastUpdate 
                          ? format(new Date(stat.lastUpdate), 'yyyy-MM-dd HH:mm:ss')
                          : 'No records'}
                      </TableCell>
                      <TableCell>
                        {isRecent ? (
                          <Badge variant="success" className="bg-green-600">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2"></span>
                            Active
                          </Badge>
                        ) : stat.totalCount > 0 ? (
                          <Badge variant="secondary" className="bg-yellow-600">
                            <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
                            Inactive
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-600">
                            <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
                            No Data
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {!stats.some(s => s.recentCount > 0) && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-medium text-yellow-500">No recent scraper activity detected</h3>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  The scraper doesn't appear to be adding new records to the database. Possible reasons:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 ml-2">
                  <li>Scrape jobs are not running due to missing or incorrect URLs</li>
                  <li>Source websites may have changed their structure</li>
                  <li>There may be network connectivity issues</li>
                  <li>The scraper may be failing to parse the website content</li>
                </ul>
                <p className="text-sm text-gray-300 mt-2">
                  Try manually triggering a job or check the scraper logs for more details.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScraperStatusMonitor;

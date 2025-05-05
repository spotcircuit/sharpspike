
import { useState, useEffect, useCallback } from 'react';
import { OddsService } from '../utils/api/oddsService';
import { Horse } from '../utils/types';

interface OddsDataState {
  horses: Horse[];
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  mtp: number;
}

interface UseOddsDataOptions {
  track?: string;
  race?: number;
  refreshInterval?: number; // in seconds
  autoRefresh?: boolean;
}

/**
 * Hook for fetching and managing odds data
 */
export const useOddsData = ({
  track,
  race,
  refreshInterval = 20, // Default 20 seconds
  autoRefresh = true,
}: UseOddsDataOptions = {}) => {
  const [state, setState] = useState<OddsDataState>({
    horses: [],
    lastUpdated: new Date().toLocaleTimeString(),
    isLoading: true,
    error: null,
    mtp: 0,
  });
  
  const [nextUpdateIn, setNextUpdateIn] = useState(refreshInterval);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Fetch fresh odds data
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await OddsService.fetchLiveOdds({ track, race });
      
      setState({
        horses: result.horses,
        lastUpdated: new Date().toLocaleTimeString(),
        isLoading: false,
        error: null,
        mtp: result.trackInfo?.mtp || 0,
      });
      
      setNextUpdateIn(refreshInterval);
      setShowUpdateNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => setShowUpdateNotification(false), 3000);
      
      return result.horses;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch odds data' 
      }));
      return null;
    }
  }, [track, race, refreshInterval]);

  // Initialize data on mount
  useEffect(() => {
    refreshData();
  }, [track, race]);
  
  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      setNextUpdateIn(prev => {
        if (prev <= 1) {
          refreshData();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [refreshData, refreshInterval, autoRefresh]);

  return {
    horses: state.horses,
    lastUpdated: state.lastUpdated,
    isLoading: state.isLoading,
    error: state.error,
    mtp: state.mtp,
    nextUpdateIn,
    showUpdateNotification,
    refreshData,
  };
};

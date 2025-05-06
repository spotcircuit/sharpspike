
import React from 'react';
import { Loader2, Database, AlertCircle, FileText } from 'lucide-react';

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <Loader2 className="h-10 w-10 animate-spin text-betting-skyBlue mb-4" />
    <p className="text-gray-400">Loading live data stream...</p>
  </div>
);

export const ErrorState = ({ error }: { error: string }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
    <p className="text-red-400">{error}</p>
  </div>
);

export const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <Database className="h-10 w-10 text-gray-500 mb-4" />
    <p className="text-gray-400">No data available. Run a scrape job to see live data.</p>
  </div>
);

export const StreamItemIndicator = () => (
  <div className="mt-2 text-xs text-betting-skyBlue">
    <FileText className="h-3 w-3 inline mr-1" />
    Latest data received
  </div>
);

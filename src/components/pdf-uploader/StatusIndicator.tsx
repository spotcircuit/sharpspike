
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';

interface StatusIndicatorProps {
  isUploading: boolean;
  uploadProgress: number;
  extractionStatus: 'idle' | 'processing' | 'success' | 'error';
  extractionError: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isUploading,
  uploadProgress,
  extractionStatus,
  extractionError
}) => {
  if ((!isUploading && uploadProgress === 0) && extractionStatus === 'idle') {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {(isUploading || uploadProgress > 0) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {extractionStatus === 'processing' && (
        <Alert className="bg-betting-dark border-betting-mediumBlue">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Processing PDF</AlertTitle>
          <AlertDescription>
            Extracting race data from the PDF. This may take a moment...
          </AlertDescription>
        </Alert>
      )}
      
      {extractionStatus === 'success' && (
        <Alert className="bg-betting-dark border-green-600">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Race data successfully extracted and saved to the database.
          </AlertDescription>
        </Alert>
      )}
      
      {extractionStatus === 'error' && (
        <Alert className="bg-betting-dark border-red-600" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {extractionError || "Failed to extract data from the PDF. Please try again."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StatusIndicator;

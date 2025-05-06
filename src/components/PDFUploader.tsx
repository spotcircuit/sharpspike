
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { updateMockData } from '@/utils/mockData';
import { PDFExtractionResult } from '@/utils/types';
import UploadForm from './pdf-uploader/UploadForm';
import StatusIndicator from './pdf-uploader/StatusIndicator';
import InfoPanel from './pdf-uploader/InfoPanel';
import { processMockPDFData } from '@/services/pdfProcessingService';

interface PDFUploaderProps {
  onDataExtracted?: (data: any) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onDataExtracted }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadProgress(0);
    setExtractionStatus('idle');
    setExtractionError(null);
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Simulate file upload and processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Start extraction process
      setExtractionStatus('processing');
      
      // Simulate extraction process (In a real implementation, this would call a serverless function)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demonstration, generate mock data based on the file name
      const mockExtractedData = await processMockPDFData(file.name);
      
      // Update the application data with the extracted data
      updateMockData({
        horses: mockExtractedData.data?.horses.map((horse, index) => ({
          id: index + 1,
          pp: horse.pp,
          name: horse.name,
          isFavorite: index === 0,
          liveOdds: horse.mlOdds || 3.5 + (Math.random() * 3),
          mlOdds: horse.mlOdds,
          modelOdds: (horse.mlOdds || 3.5) + (Math.random() * 0.5 - 0.25),
          difference: parseFloat((Math.random() * 0.6 - 0.3).toFixed(2)),
          jockey: horse.jockey,
          trainer: horse.trainer,
          jockeyWinPct: Math.floor(10 + Math.random() * 20),
          trainerWinPct: Math.floor(10 + Math.random() * 20),
          hFactors: {
            speed: Math.random() > 0.5,
            pace: Math.random() > 0.5,
            form: Math.random() > 0.5,
            class: Math.random() > 0.5,
          },
          irregularBetting: Math.random() > 0.9,
        })) || [],
        lastUpdated: new Date().toLocaleTimeString(),
        trackName: mockExtractedData.data?.trackName,
        raceNumber: mockExtractedData.data?.raceNumber,
      });
      
      setExtractionStatus('success');
      toast({
        title: "Data extracted successfully",
        description: `Extracted data for ${mockExtractedData.data?.horses.length} horses`,
      });
      
      if (onDataExtracted && mockExtractedData.data) {
        onDataExtracted(mockExtractedData.data);
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      setExtractionStatus('error');
      setExtractionError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: "Extraction failed",
        description: "Failed to extract data from the PDF",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardContent className="pt-6 space-y-4">
        <UploadForm 
          isUploading={isUploading}
          onFileSelected={handleFileSelected}
          onUpload={handleUpload}
        />
        
        <StatusIndicator 
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          extractionStatus={extractionStatus}
          extractionError={extractionError}
        />
        
        <InfoPanel />
      </CardContent>
    </Card>
  );
};

export default PDFUploader;

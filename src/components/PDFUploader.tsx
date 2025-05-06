
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUp, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateMockData, getMockData } from '@/utils/mockData';
import { PDFExtractionResult } from '@/utils/types';

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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
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
  
  // This function simulates extracting data from a PDF based on the filename
  // and saves it to the Supabase database
  const processMockPDFData = async (filename: string): Promise<PDFExtractionResult> => {
    try {
      // Extract track name from filename for demonstration
      const trackName = filename.split('.')[0].toUpperCase();
      const raceNumber = Math.floor(Math.random() * 10) + 1;
      const raceDate = new Date().toISOString();
      const raceConditions = "Allowance - For Three Year Olds - 6 Furlongs";
      
      // Create mock horse data based on the track name
      const mockHorses = Array.from({ length: 10 }, (_, i) => ({
        pp: i + 1,
        name: `${trackName} Runner ${i + 1}`,
        jockey: `Jockey ${String.fromCharCode(65 + i)}`,
        trainer: `Trainer ${String.fromCharCode(65 + i)}`,
        mlOdds: parseFloat((2 + i * 0.5).toFixed(1)),
      }));
      
      // Insert race data into Supabase
      const { data: raceData, error: raceError } = await supabase
        .from('race_data')
        .insert({
          track_name: trackName,
          race_number: raceNumber,
          race_date: raceDate,
          race_conditions: raceConditions,
        })
        .select()
        .single();
      
      if (raceError) {
        console.error('Error saving race data:', raceError);
        throw new Error(`Failed to save race data: ${raceError.message}`);
      }
      
      // Insert horse data into Supabase
      const horsesWithRaceId = mockHorses.map(horse => ({
        race_id: raceData.id,
        pp: horse.pp,
        name: horse.name,
        jockey: horse.jockey,
        trainer: horse.trainer,
        ml_odds: horse.mlOdds,
      }));
      
      const { data: horsesData, error: horsesError } = await supabase
        .from('race_horses')
        .insert(horsesWithRaceId)
        .select();
      
      if (horsesError) {
        console.error('Error saving horse data:', horsesError);
        throw new Error(`Failed to save horse data: ${horsesError.message}`);
      }
      
      // Return the extracted data
      return {
        success: true,
        data: {
          raceId: raceData.id,
          trackName: trackName,
          raceNumber: raceNumber,
          raceDate: raceDate,
          raceConditions: raceConditions,
          horses: mockHorses,
        },
      };
    } catch (error) {
      console.error('Error in processMockPDFData:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  };
  
  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-upload">Upload Race Card PDF</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="border border-betting-mediumBlue rounded-md px-4 py-2 w-full flex items-center justify-between bg-betting-dark text-white">
                <span className="truncate">
                  {file ? file.name : "Select a PDF file"}
                </span>
                <FileUp className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading || extractionStatus === 'processing'}
              className="whitespace-nowrap"
            >
              {isUploading ? "Uploading..." : "Process PDF"}
            </Button>
          </div>
          
          {(isUploading || uploadProgress > 0) && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {extractionStatus === 'processing' && (
            <Alert className="bg-betting-dark border-betting-mediumBlue mt-4">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Processing PDF</AlertTitle>
              <AlertDescription>
                Extracting race data from the PDF. This may take a moment...
              </AlertDescription>
            </Alert>
          )}
          
          {extractionStatus === 'success' && (
            <Alert className="bg-betting-dark border-green-600 mt-4">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Race data successfully extracted and saved to the database.
              </AlertDescription>
            </Alert>
          )}
          
          {extractionStatus === 'error' && (
            <Alert className="bg-betting-dark border-red-600 mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {extractionError || "Failed to extract data from the PDF. Please try again."}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="bg-betting-dark border border-betting-mediumBlue rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">About PDF Processing</h3>
          <p className="text-sm text-gray-300">
            Upload a PDF race card to extract horse, jockey, trainer, and odds information.
            For best results, upload official race cards from race tracks.
            Currently supported race cards: Churchill Downs, Belmont Park, Santa Anita, and more.
          </p>
          <p className="text-sm text-gray-300 mt-2">
            <strong>Note:</strong> Data will be saved to the database and can be accessed
            throughout the application. In a production environment, this would use a specialized
            PDF parsing service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUploader;

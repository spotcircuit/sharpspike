
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateFullDemoData } from '@/utils/demoDataGenerator';
import { AlertCircle, Database, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DemoDataGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    setResult(null);
    
    try {
      const success = await generateFullDemoData();
      
      setResult({
        success,
        message: success 
          ? 'Demo data successfully generated!' 
          : 'Failed to generate some demo data. Check console for details.'
      });
    } catch (error) {
      console.error('Error in demo data generation:', error);
      setResult({
        success: false,
        message: 'An unexpected error occurred during data generation.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-betting-navyBlue border-betting-mediumBlue">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-300">
          Generate a complete set of sample data for all tracks and races to demonstrate 
          the full capabilities of the application.
        </p>
        
        <div className="bg-betting-dark border border-betting-mediumBlue rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">What will be generated:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>10 tracks with 5-12 races each</li>
            <li>6-12 horses per race with jockeys, trainers and odds</li>
            <li>Exotic wagers and will-pays for each race</li>
            <li>Results for approximately 60% of races</li>
          </ul>
        </div>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleGenerateData}
          disabled={isGenerating}
          className="w-full"
          variant={isGenerating ? "outline" : "default"}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Demo Data...
            </>
          ) : (
            'Generate Complete Demo Data'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DemoDataGenerator;

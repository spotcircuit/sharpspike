
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExoticWillPay } from '@/types/ScraperTypes';
import { RefreshCw } from 'lucide-react';

interface WillPaysDisplayProps {
  willPays: ExoticWillPay[];
  isLoading: boolean;
}

const WillPaysDisplay: React.FC<WillPaysDisplayProps> = ({ willPays, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (willPays.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        No will pays data available for this race
      </div>
    );
  }
  
  // Group by wager type
  const willPaysByType: Record<string, ExoticWillPay[]> = {};
  
  willPays.forEach(will => {
    if (!willPaysByType[will.wager_type]) {
      willPaysByType[will.wager_type] = [];
    }
    willPaysByType[will.wager_type].push(will);
  });
  
  return (
    <div className="space-y-4">
      {Object.entries(willPaysByType).map(([wagerType, pays]) => (
        <Card key={wagerType} className="bg-betting-darkCard border-betting-tertiaryPurple">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{wagerType}</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-betting-darkPurple">
                  <TableRow>
                    <TableHead className="text-white">Combination</TableHead>
                    <TableHead className="text-white">Payout</TableHead>
                    <TableHead className="text-white">Carryover</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pays.map((pay) => (
                    <TableRow key={pay.id} className="hover:bg-betting-darkPurple/20">
                      <TableCell className="font-medium">{pay.combination}</TableCell>
                      <TableCell className="font-bold">
                        {pay.payout ? `$${pay.payout.toFixed(2)}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {pay.is_carryover ? (
                          <span className="text-green-500">
                            {pay.carryover_amount ? `$${pay.carryover_amount.toFixed(2)}` : 'Yes'}
                          </span>
                        ) : 'No'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WillPaysDisplay;


import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface HorseComment {
  name: string;
  comment: string;
}

interface HorseCommentsProps {
  comments: HorseComment[];
}

const HorseComments: React.FC<HorseCommentsProps> = ({ comments }) => {
  return (
    <Card className="border-4 border-blue-600 shadow-xl bg-betting-darkCard overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Horse Comments</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {comments.map((horse, index) => (
            <div key={index} className="p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
              <h3 className="text-sm font-bold text-yellow-400 mb-1">{horse.name}</h3>
              <p className="text-xs text-gray-200 leading-relaxed">{horse.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HorseComments;

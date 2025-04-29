
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PaddockComment {
  timestamp: string;
  horse: string;
  comment: string;
}

interface LivePaddockCommentsProps {
  comments: PaddockComment[];
}

const LivePaddockComments: React.FC<LivePaddockCommentsProps> = ({ comments }) => {
  return (
    <Card className="border-4 border-betting-mediumBlue shadow-xl bg-betting-darkCard overflow-hidden h-full">
      <CardHeader className="bg-naval-gradient px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Live Paddock Comments</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto max-h-[300px]">
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
              <div className="flex justify-between mb-1">
                <h3 className="text-sm font-bold text-yellow-400">{comment.horse}</h3>
                <span className="text-xs text-gray-400">{comment.timestamp}</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">{comment.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePaddockComments;


import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-radial from-betting-dark to-black p-4 text-white flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
          Trackside Odds Pulse
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Your comprehensive platform for live race track odds, pools movement tracking, and expert analysis.
        </p>
        <div className="space-y-4">
          <Link to="/odds-dashboard">
            <Button 
              className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            >
              Go to Odds Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React from 'react';

const AuthHeader = () => {
  return (
    <header className="mb-6 text-center">
      <div className="flex justify-center mb-4">
        <img 
          src="/lovable-uploads/5defcb2c-7ced-4277-920c-a9a6f9ad2358.png" 
          alt="Quantum 5DRACING" 
          className="h-28 object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold text-white">
        5D Odds Pulse
      </h1>
      <p className="text-orange-500 mt-2 font-bold">
        Sign in to access TB Odds Pulse, AI analytics rankings and our Quantum Bets (e.g., Ex-Tri-Pick3)
      </p>
    </header>
  );
};

export default AuthHeader;

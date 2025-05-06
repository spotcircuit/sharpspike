
import React from 'react';

const InfoPanel: React.FC = () => {
  return (
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
  );
};

export default InfoPanel;

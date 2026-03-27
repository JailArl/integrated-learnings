import React, { useEffect } from 'react';

const EnrichmentGame: React.FC = () => {
  // The game now handles its own access-code auth directly
  useEffect(() => {
    window.location.href = '/games/life-choices.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading game...</p>
      </div>
    </div>
  );
};

export default EnrichmentGame;

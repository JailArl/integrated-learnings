import React, { useEffect } from 'react';

const EnrichmentLogin: React.FC = () => {
  // The game now handles its own access-code auth, so redirect directly
  useEffect(() => {
    window.location.href = '/games/life-choices.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Redirecting to game...</p>
      </div>
    </div>
  );
};

export default EnrichmentLogin;

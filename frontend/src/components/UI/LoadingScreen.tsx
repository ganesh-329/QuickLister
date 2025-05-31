import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <img src="/images/logo.svg" alt="QuickLister Logo" className="h-16 w-16 mx-auto mb-4" />
        <LoadingSpinner size="large" />
        <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        <p className="text-gray-500">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

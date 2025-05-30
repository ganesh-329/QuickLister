import React from 'react';

interface FloatingActionButtonProps {
  isAuthenticated: boolean;
  onLoginClick?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  isAuthenticated,
  onLoginClick
}) => {
  const handleClick = () => {
    if (!isAuthenticated && onLoginClick) {
      onLoginClick();
      return;
    }
    // Handle create gig when authenticated
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-6 bottom-20 z-30 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="sr-only">Create New Gig</span>
    </button>
  );
};

export default FloatingActionButton;

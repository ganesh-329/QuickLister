import React, { useState } from 'react';
import { PlusIcon, BriefcaseIcon } from 'lucide-react';
import Modal from './Modal';
import CreateGigForm from '../Gig/CreateGigForm';
import { useGigStore } from '../../stores/gigStore';

interface FloatingActionButtonProps {
  isAuthenticated: boolean;
  onLoginClick?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  isAuthenticated,
  onLoginClick
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { fetchGigs } = useGigStore();

  const handleClick = () => {
    if (!isAuthenticated && onLoginClick) {
      onLoginClick();
      return;
    }
    
    if (isAuthenticated) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    fetchGigs();
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <>
      {/* Simple Plus Button */}
      <div className="fixed right-6 bottom-20 z-30">
        <button
          onClick={handleClick}
          className={`group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
            !isAuthenticated ? 'animate-pulse' : ''
          }`}
          style={{ minWidth: '56px', minHeight: '56px' }}
          aria-label={isAuthenticated ? 'Create new job' : 'Login to create job'}
        >
          {/* Enhanced Shadow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
          
          {/* Icon */}
          <div className="relative flex items-center justify-center">
            {isAuthenticated ? (
              <PlusIcon size={24} className="transition-transform duration-300" />
            ) : (
              <BriefcaseIcon size={24} className="transition-transform duration-300" />
            )}
          </div>
        </button>

        {/* Status Indicator for Non-authenticated Users */}
        {!isAuthenticated && (
          <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-bounce shadow-lg">
            Login
          </div>
        )}
      </div>

      {/* Create Gig Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="🚀 Create New Gig"
        size="lg"
      >
        <CreateGigForm
          onClose={handleCloseModal}
          onSuccess={handleCreateSuccess}
        />
      </Modal>
    </>
  );
};

export default FloatingActionButton;

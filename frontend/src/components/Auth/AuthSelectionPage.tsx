import React from 'react';

interface AuthSelectionPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onBack: () => void;
}

const AuthSelectionPage: React.FC<AuthSelectionPageProps> = ({
  onLoginClick,
  onSignupClick,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Auth Options */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Get Started
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Choose an option to continue
          </p>
          <div className="space-y-4">
            <button
              onClick={onLoginClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Log In
            </button>
            <button
              onClick={onSignupClick}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectionPage;

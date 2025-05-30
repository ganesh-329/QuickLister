import React from 'react';

interface LeftSidebarProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isOpen,
  isAuthenticated,
  onLoginClick
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 bg-white border-r border-gray-200 p-4 transition duration-200 ease-in-out lg:relative lg:inset-0 lg:transform-none z-30`}
    >
      {/* User Actions Section */}
      {isAuthenticated ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">My Account</h2>
          <nav className="space-y-2">
            <a
              href="#profile"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Profile
            </a>
            <a
              href="#my-gigs"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              My Gigs
            </a>
            <a
              href="#applications"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Applications
            </a>
          </nav>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Welcome!</h2>
          <div className="text-gray-600">
            <p className="mb-4">Sign in to post and apply for gigs.</p>
            <button
              onClick={onLoginClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <nav className="space-y-2">
          <a
            href="#home-services"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Home Services
          </a>
          <a
            href="#tech-services"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Tech Services
          </a>
          <a
            href="#cleaning"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cleaning
          </a>
          <a
            href="#tutoring"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Tutoring
          </a>
          <a
            href="#all-categories"
            className="block px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
          >
            View all categories →
          </a>
        </nav>
      </div>

      {/* Help Section */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Help & Support</h2>
        <nav className="space-y-2">
          <a
            href="#how-it-works"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            How it works
          </a>
          <a
            href="#safety"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Safety & Trust
          </a>
          <a
            href="#support"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Support Center
          </a>
        </nav>
      </div>
    </div>
  );
};

export default LeftSidebar;

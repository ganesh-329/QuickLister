import React from 'react';
import SearchBar from '../UI/SearchBar';
import { User } from '../../components/Auth/AuthContext';

interface TopBarProps {
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLocationSelect: (place: any) => void;
  isMapsApiLoaded: boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  toggleSidebar,
  toggleRightPanel,
  searchQuery,
  setSearchQuery,
  onLocationSelect,
  isMapsApiLoaded,
  isAuthenticated,
  user,
  onLoginClick,
  onSignupClick,
  onLogout
}) => {
  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex">
            <button
              onClick={toggleSidebar}
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-start max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onLocationSelect={onLocationSelect}
              isMapsApiLoaded={isMapsApiLoaded}
            />
          </div>

          {/* Right section */}
          <div className="flex items-center lg:gap-4">
            {/* Filters button */}
            <button
              onClick={toggleRightPanel}
              className="p-2 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Open filters</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            {/* Auth buttons or user menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <img
                    src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={onLogout}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoginClick}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Log in
                </button>
                <button
                  onClick={onSignupClick}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

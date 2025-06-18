import React, { useState, useRef, useEffect } from 'react';
import SearchBar from '../UI/SearchBar';
import { User } from '../../components/Auth/AuthContext';

interface TopBarProps {
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLocationSelect: (place: any) => void;
  isMapsApiLoaded: boolean;
  isAuthenticated: boolean;
  user: User | null;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLogout: () => void;
  onSearchSubmit?: (query: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  toggleSidebar,
  searchQuery,
  setSearchQuery,
  onLocationSelect,
  isMapsApiLoaded,
  isAuthenticated,
  user,
  onLoginClick,
  onSignupClick,
  onLogout,
  onSearchSubmit
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    onSearchSubmit?.(query);
  };

  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="px-2 py-2 bg-white rounded-full shadow text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Open sidebar"
            >
              <img src="https://img.icons8.com/?size=100&id=hW5GrtDF3kx6&format=png&color=000000" alt="Open sidebar" width={28} height={28} />
            </button>
            <div className="ml-2 flex flex-col">
              <div className="flex items-center">
                <img src="/images/logo.svg" alt="QuickLister Logo" className="h-8 w-8" />
                <span className="ml-2 text-2xl font-bold text-blue-700">QuickLister</span>
              </div>
              <span className="text-sm text-gray-600">List. Connect. Earn. Repeat.</span>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-start max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onLocationSelect={onLocationSelect}
              isMapsApiLoaded={isMapsApiLoaded}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* Right section */}
          <div className="flex items-center lg:gap-4">
            {/* Auth buttons or user menu */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=random`}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                </button>
                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        window.location.href = '/profile';
                      }}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Log out
                    </button>
                  </div>
                )}
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

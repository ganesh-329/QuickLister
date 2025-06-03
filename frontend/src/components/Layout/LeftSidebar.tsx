import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  FileTextIcon, 
  UserIcon, 
  SearchIcon, 
  HelpCircleIcon, 
  LogOutIcon 
} from 'lucide-react';

interface LeftSidebarProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
  onClose: () => void;
  onLogout: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isOpen,
  isAuthenticated,
  onLoginClick,
  onClose,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close sidebar on mobile after navigation
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`
        w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'fixed inset-y-0 left-0 z-30 md:static' : 'fixed inset-y-0 -left-64 z-30 md:hidden'}
      `}
    >
      <div className="flex-1 px-4 py-6">
        {/* Core Navigation Section */}
        {isAuthenticated ? (
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              <nav className="space-y-2">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HomeIcon size={18} className="mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation('/dashboard/my-gigs')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    isActive('/dashboard/my-gigs') 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BriefcaseIcon size={18} className="mr-3" />
                  My Gigs
                </button>
                <button
                  onClick={() => handleNavigation('/dashboard/applications')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    isActive('/dashboard/applications') 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileTextIcon size={18} className="mr-3" />
                  Applications
                </button>
                <button
                  onClick={() => handleNavigation('/profile')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    isActive('/profile') 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserIcon size={18} className="mr-3" />
                  Profile
                </button>
              </nav>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Navigation Section */}
            <div>
              <nav className="space-y-2">
                <button
                  onClick={() => handleNavigation('/main')}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    isActive('/main') 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SearchIcon size={18} className="mr-3" />
                  Browse Jobs
                </button>
              </nav>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Welcome!</h2>
            <div className="text-gray-600">
              <p className="mb-4">Sign in to post and apply for gigs.</p>
              <button
                onClick={onLoginClick}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      {isAuthenticated && (
        <div className="border-t border-gray-200 px-4 py-4">
          <nav className="space-y-2">
            <button
              onClick={() => handleNavigation('/help')}
              className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <HelpCircleIcon size={18} className="mr-3" />
              Help & Support
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOutIcon size={18} className="mr-3" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;

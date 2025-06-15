import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  FileTextIcon, 
  UserIcon, 
  SearchIcon, 
  LogOutIcon 
} from 'lucide-react';

interface LeftSidebarProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onLoginClick?: () => void;
  onLogout: () => void;
  onClose?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isOpen,
  isAuthenticated,
  onLoginClick,
  onLogout,
  onClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Removed automatic close - sidebar will only close when toggle button is clicked
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleBackdropClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden transition-all duration-300 ease-out"
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl
          fixed inset-y-0 z-30 md:static md:shadow-none
          transform transition-all duration-300 ease-out
          ${isOpen 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-full opacity-0 md:opacity-100 md:translate-x-0 md:hidden'
          }
        `}
        style={{
          willChange: 'transform, opacity'
        }}
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
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                      isActive('/dashboard') 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                    }`}
                  >
                    <HomeIcon size={18} className="mr-3" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation('/my-gigs')}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                      isActive('/my-gigs') 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                    }`}
                  >
                    <BriefcaseIcon size={18} className="mr-3" />
                    My Gigs
                  </button>
                  <button
                    onClick={() => handleNavigation('/applications')}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                      isActive('/applications') 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                    }`}
                  >
                    <FileTextIcon size={18} className="mr-3" />
                    Applications
                  </button>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                      isActive('/profile') 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
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
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                      isActive('/main') 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
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
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
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
                onClick={onLogout}
                className="w-full flex items-center px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:translate-x-1"
              >
                <LogOutIcon size={18} className="mr-3" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default LeftSidebar;

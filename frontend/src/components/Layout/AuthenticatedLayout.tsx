import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import FloatingActionButton from '../UI/FloatingActionButton';
import FloatingChatbot from '../UI/FloatingChatbot';
import { useAuth } from '../Auth';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isMapsApiLoaded?: boolean;
  onSearchSubmit?: (query: string) => void;
}

function AuthenticatedLayout({ 
  children,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  isMapsApiLoaded: externalIsMapsApiLoaded,
  onSearchSubmit: externalOnSearchSubmit
}: AuthenticatedLayoutProps) {
  // Persist sidebar state across navigation using localStorage
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });

  // Update localStorage when sidebar state changes
  React.useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  
  // Use external state if provided, otherwise use internal state
  const [internalSearchQuery, setInternalSearchQuery] = React.useState('');
  const [internalIsMapsApiLoaded] = React.useState(false);
  
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery ?? setInternalSearchQuery;
  const isMapsApiLoaded = externalIsMapsApiLoaded ?? internalIsMapsApiLoaded;

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (query: string) => {
    // If there's an external search submit handler, use it
    if (externalOnSearchSubmit) {
      externalOnSearchSubmit(query);
    } else {
      // Default behavior: navigate to main page with search query
      if (window.location.pathname !== '/main') {
        navigate('/main');
      }
      // The search query will be handled by the SearchBar component
      console.log('Search submitted:', query);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 relative overflow-hidden">
      <TopBar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLocationSelect={() => {}}
        isMapsApiLoaded={isMapsApiLoaded}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
        onSearchSubmit={handleSearchSubmit}
      />
      <div className="flex flex-1 relative min-h-0">
        <LeftSidebar 
          isOpen={sidebarOpen}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => navigate('/login')}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 relative transition-all duration-300 overflow-y-auto h-full">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
      <FloatingActionButton isAuthenticated={isAuthenticated} />
      <FloatingChatbot />
    </div>
  );
}

export default AuthenticatedLayout;

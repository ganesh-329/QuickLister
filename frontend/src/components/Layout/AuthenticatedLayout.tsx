import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import FloatingActionButton from '../UI/FloatingActionButton';
import FloatingChatbot from '../UI/FloatingChatbot';
import Footer from './Footer';
import { useAuth } from '../Auth';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  activeFilters?: string[];
  setActiveFilters?: (filters: string[]) => void;
  selectedLocation?: any;
  setSelectedLocation?: (location: any) => void;
  isMapsApiLoaded?: boolean;
}

function AuthenticatedLayout({ 
  children,
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  activeFilters: externalActiveFilters,
  setActiveFilters: externalSetActiveFilters,
  selectedLocation: externalSelectedLocation,
  setSelectedLocation: externalSetSelectedLocation,
  isMapsApiLoaded: externalIsMapsApiLoaded
}: AuthenticatedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  
  // Use external state if provided, otherwise use internal state
  const [internalActiveFilters, setInternalActiveFilters] = React.useState<string[]>([]);
  const [internalSearchQuery, setInternalSearchQuery] = React.useState('');
  const [internalSelectedLocation, setInternalSelectedLocation] = React.useState<any>(null);
  const [internalIsMapsApiLoaded, setInternalIsMapsApiLoaded] = React.useState(false);
  
  const activeFilters = externalActiveFilters ?? internalActiveFilters;
  const setActiveFilters = externalSetActiveFilters ?? setInternalActiveFilters;
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery ?? setInternalSearchQuery;
  const selectedLocation = externalSelectedLocation ?? internalSelectedLocation;
  const setSelectedLocation = externalSetSelectedLocation ?? setInternalSelectedLocation;
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

  // Just use children as-is since props are now passed from the parent
  const enhancedChildren = children;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 relative">
      <TopBar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        toggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLocationSelect={setSelectedLocation}
        isMapsApiLoaded={isMapsApiLoaded}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
      />
      <div className="flex flex-1 relative">
        <LeftSidebar 
          isOpen={sidebarOpen}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => navigate('/login')}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className="flex-1 relative transition-all duration-300 overflow-y-auto">
          {children}
        </main>
        <RightPanel 
          isOpen={rightPanelOpen}
          setActiveFilters={setActiveFilters}
          activeFilters={activeFilters}
          onClose={() => setRightPanelOpen(false)}
        />
      </div>
      <FloatingActionButton isAuthenticated={isAuthenticated} />
      <FloatingChatbot />
      <Footer />
    </div>
  );
}

export default AuthenticatedLayout;

import React, { useState, useEffect } from 'react';
import MapView from './components/Map/MapView';
import TopBar from './components/Layout/TopBar';
import LeftSidebar from './components/Layout/LeftSidebar';
import RightPanel from './components/Layout/RightPanel';
import FloatingActionButton from './components/UI/FloatingActionButton';
import FloatingChatbot from './components/UI/FloatingChatbot';
import Modal from './components/UI/Modal';
import LoadingScreen from './components/UI/LoadingScreen';
import LandingPage from './components/Pages/LandingPage';
import AuthSelectionPage from './components/Auth/AuthSelectionPage';
import { AuthProvider, useAuth, LoginForm, SignupForm, OTPVerification } from './components/Auth';

type PlaceType = google.maps.places.PlaceResult;

// App wrapper with auth provider
export function AppWithAuth() {
  return (
    <React.StrictMode>
      <React.Suspense fallback={<LoadingScreen />}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.Suspense>
    </React.StrictMode>
  );
}

// Main app component
function App() {
  // Page navigation state
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth-selection' | 'login' | 'signup' | 'main'>('landing');

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<PlaceType | null>(null);
  const [isMapsApiLoaded, setIsMapsApiLoaded] = useState(false);

  // Auth state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // UI handlers
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);
  const handleLocationSelect = (place: PlaceType) => setSelectedLocation(place);

  // Page navigation handlers
  const handleGetStarted = () => {
    setCurrentPage('auth-selection');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleSignupClick = () => {
    setCurrentPage('signup');
  };

  const handleBackToAuthSelection = () => {
    setCurrentPage('auth-selection');
  };

  const handleAuthSuccess = () => {
    if (!user?.isPhoneVerified) {
      setShowOTPVerification(true);
    }
    setCurrentPage('main');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  // Check auth status on mount and redirect accordingly
  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.isPhoneVerified) {
        setShowOTPVerification(true);
      }
      setCurrentPage('main');
    } else {
      setCurrentPage('landing');
    }
  }, [isAuthenticated, user]);

  // Render based on current page
  if (!isAuthenticated) {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;

      case 'auth-selection':
        return (
          <AuthSelectionPage
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            onBack={handleBackToLanding}
          />
        );

      case 'login':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <button
                onClick={handleBackToAuthSelection}
                className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <LoginForm onSignupClick={handleSignupClick} onSuccess={handleAuthSuccess} />
            </div>
          </div>
        );

      case 'signup':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <button
                onClick={handleBackToAuthSelection}
                className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <SignupForm onLoginClick={handleLoginClick} onSuccess={handleAuthSuccess} />
            </div>
          </div>
        );

      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  }

  // Main authenticated app
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100 relative">
      <TopBar 
        toggleSidebar={toggleSidebar} 
        toggleRightPanel={toggleRightPanel} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onLocationSelect={handleLocationSelect}
        isMapsApiLoaded={isMapsApiLoaded}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
      />
      
      <div className="flex flex-1 relative overflow-hidden">
        <LeftSidebar 
          isOpen={sidebarOpen}
          isAuthenticated={isAuthenticated}
        />
        
        <main className="flex-1 relative">
          <MapView 
            searchQuery={searchQuery} 
            activeFilters={activeFilters} 
            selectedLocation={selectedLocation}
            onMapsApiLoaded={setIsMapsApiLoaded}
          />
        </main>
        
        <RightPanel 
          isOpen={rightPanelOpen} 
          setActiveFilters={setActiveFilters} 
          activeFilters={activeFilters} 
        />
      </div>
      
      <FloatingActionButton isAuthenticated={isAuthenticated} />
      <FloatingChatbot />

      {/* OTP Verification Modal */}
      <Modal 
        isOpen={showOTPVerification} 
        onClose={() => setShowOTPVerification(false)}
        closeOnOverlayClick={false}
        title="Phone Verification"
      >
        <OTPVerification 
          phoneNumber={user?.phone || ''} 
          onVerificationComplete={() => setShowOTPVerification(false)} 
        />
      </Modal>
    </div>
  );
}

export default AppWithAuth;

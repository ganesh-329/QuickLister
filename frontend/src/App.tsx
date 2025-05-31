import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MapView from './components/Map/MapView';
import TopBar from './components/Layout/TopBar';
import LeftSidebar from './components/Layout/LeftSidebar';
import RightPanel from './components/Layout/RightPanel';
import FloatingActionButton from './components/UI/FloatingActionButton';
import FloatingChatbot from './components/UI/FloatingChatbot';
import LoadingScreen from './components/UI/LoadingScreen';
import LandingPage from './components/Pages/LandingPage';
import AuthSelectionPage from './components/Auth/AuthSelectionPage';
import Footer from './components/Layout/Footer';
import LogoHeader from './components/Layout/LogoHeader';
import { AuthProvider, useAuth, LoginForm, SignupForm } from './components/Auth';

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

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [isMapsApiLoaded, setIsMapsApiLoaded] = React.useState(false);
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

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100 relative">
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
      <div className="flex flex-1 relative overflow-hidden">
        <LeftSidebar 
          isOpen={sidebarOpen}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => navigate('/login')}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 relative transition-all duration-300">
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
      <Footer />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/main" /> : <LandingPage onGetStarted={() => window.location.href = '/auth-selection'} />} />
        <Route path="/auth-selection" element={isAuthenticated ? <Navigate to="/main" /> : <AuthSelectionPage onLoginClick={() => window.location.href = '/login'} onSignupClick={() => window.location.href = '/signup'} onBack={() => window.location.href = '/'} />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/main" /> : (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
              <LogoHeader />
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                  <LoginForm onSignupClick={() => window.location.href = '/signup'} />
                </div>
              </div>
              <Footer />
            </div>
          )}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/main" /> : (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
              <LogoHeader />
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                  <SignupForm onLoginClick={() => window.location.href = '/login'} onSuccess={() => window.location.href = '/main'} />
                </div>
              </div>
              <Footer />
            </div>
          )}
        />
        <Route path="/main" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppWithAuth;

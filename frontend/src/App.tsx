import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MapView from './components/Map/MapView';
import LoadingScreen from './components/UI/LoadingScreen';
import LandingPage from './components/Pages/LandingPage';
import AuthSelectionPage from './components/Auth/AuthSelectionPage';
import Footer from './components/Layout/Footer';
import LogoHeader from './components/Layout/LogoHeader';
import { MyGigs } from './components/Dashboard/MyGigs';
import Profile from './components/Profile/Profile';
import AuthenticatedLayout from './components/Layout/AuthenticatedLayout';
import { AuthProvider, useAuth, LoginForm, SignupForm } from './components/Auth';



// Navigation wrapper components with useNavigate hook
function LandingPageWrapper() {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/auth-selection')} />;
}

function AuthSelectionWrapper() {
  const navigate = useNavigate();
  return (
    <AuthSelectionPage
      onLoginClick={() => navigate('/login')}
      onSignupClick={() => navigate('/signup')}
      onBack={() => navigate('/')}
    />
  );
}

function LoginFormWrapper() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <LogoHeader />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <LoginForm onSignupClick={() => navigate('/signup')} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SignupFormWrapper() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <LogoHeader />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <SignupForm
            onLoginClick={() => navigate('/login')}
            onSuccess={() => navigate('/main')}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Enhanced layout wrapper that manages shared state for the map route
function MapRouteWithSharedState() {
  // Shared state that will be passed to both AuthenticatedLayout and MapView
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [isMapsApiLoaded, setIsMapsApiLoaded] = React.useState(false);

  return (
    <AuthenticatedLayout
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      isMapsApiLoaded={isMapsApiLoaded}
    >
      <MapView 
        searchQuery={searchQuery}
        activeFilters={activeFilters}
        selectedLocation={selectedLocation}
        onMapsApiLoaded={setIsMapsApiLoaded}
      />
    </AuthenticatedLayout>
  );
}

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

function App() {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/main" /> : <LandingPageWrapper />} />
        <Route path="/auth-selection" element={isAuthenticated ? <Navigate to="/main" /> : <AuthSelectionWrapper />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/main" /> : <LoginFormWrapper />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/main" /> : <SignupFormWrapper />}
        />
        
        {/* Map route with shared state management */}
        <Route 
          path="/main" 
          element={
            isAuthenticated ? (
              <MapRouteWithSharedState />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Other authenticated routes use default AuthenticatedLayout */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <MyGigs />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <MyGigs />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/help" 
          element={
            isAuthenticated ? (
              <AuthenticatedLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Help & Support</h1>
                  <p className="text-gray-600">Coming Soon</p>
                </div>
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default AppWithAuth;

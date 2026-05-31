import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css'; // Import App.css for Connection Banner styles
import './index.css';
import Feed from './components/Feed';
import Trending from './components/Trending';
import Rooms from './components/Rooms';
import Profile from './components/Profile';
import RecordButton from './components/RecordButton';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import RecordModal from './components/RecordModal';
import { getToken } from './utils/auth';
import { getApiUrl, API_ENDPOINTS, checkBackendHealth, isDemoMode } from './utils/api';
import { getDemoUser, initDemoData, stopDemoSpeech } from './utils/demoService';

// Google Client ID - Bu değeri .env dosyasından alacağız
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(0);
  const [isDemo, setIsDemo] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // 1. Detect if we can reach the backend
      setCheckingConnection(true);
      const online = await checkBackendHealth();
      setIsDemo(!online);
      setCheckingConnection(false);

      if (!online) {
        // Initialize local mock data for Demo Mode
        initDemoData();
        
        // Auto-login inside demo mode for immediate testing convenience,
        // or let user stay unauthenticated until clicking buttons
        const demoUser = getDemoUser();
        if (demoUser) {
          setIsAuthenticated(true);
          setUserProfile(demoUser);
        }
      } else {
        // Real authentication check in Online Mode
        const token = getToken();
        if (token) {
          setIsAuthenticated(true);
          fetchUserProfile();
        }
      }
    };

    initApp();
  }, []);

  // Stop active speech playback whenever view changes to keep UX clean
  useEffect(() => {
    stopDemoSpeech();
  }, [currentView]);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch(getApiUrl(API_ENDPOINTS.ME), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserProfile(userData);
    setShowAuthModal(false);
  };

  const handleRecordClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowRecordModal(true);
    }
  };

  const handleRecordSuccess = () => {
    setShowRecordModal(false);
    setRefreshFeed(prev => prev + 1);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setCurrentView('home');
    if (isDemoMode()) {
      // In demo mode, log out means clearing demo user session/state local storage reference
      // but keeping mock posts intact.
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app">
        {/* Connection Status Banner */}
        {!checkingConnection && (
          <div className={`connection-banner ${isDemo ? 'demo' : 'live'}`}>
            <span className="pulse-dot"></span>
            <span>
              {isDemo 
                ? '🟢 Çevrimdışı Demo Modu (Tüm özellikler aktif - Ünlü sesleri devrede)' 
                : '🔵 Canlı Sunucu Modu (MongoDB Bağlantısı Aktif!)'}
            </span>
          </div>
        )}

        {/* Main Content */}
        <main className="main-content">
          {currentView === 'home' && <Feed key={refreshFeed} />}
          {currentView === 'trending' && <Trending />}
          {currentView === 'rooms' && <Rooms />}
          {currentView === 'profile' && <Profile user={userProfile} onLogout={handleLogout} />}
        </main>

        {/* Record Button - Floating */}
        <RecordButton onClick={handleRecordClick} />

        {/* Bottom Navigation */}
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}

        {/* Record Modal */}
        {showRecordModal && (
          <RecordModal
            onClose={() => setShowRecordModal(false)}
            onSuccess={handleRecordSuccess}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;


import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
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

// Google Client ID - Bu değeri .env dosyasından alacağız
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(0);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/auth/me', {
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
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app">
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

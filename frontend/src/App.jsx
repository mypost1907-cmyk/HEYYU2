import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import Feed from './components/Feed';
import RecordButton from './components/RecordButton';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import { getToken } from './utils/auth';

// Google Client ID - Bu değeri .env dosyasından alacağız
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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
      // Open record modal
      // TODO: Implement record modal
      console.log('Open record modal');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app">
        {/* Main Content */}
        <main className="main-content">
          {currentView === 'home' && <Feed />}
          {currentView === 'trending' && <div className="container"><h2>Trending 🔥</h2></div>}
          {currentView === 'rooms' && <div className="container"><h2>Voice Rooms 💬</h2></div>}
          {currentView === 'profile' && <div className="container"><h2>Profile 👤</h2></div>}
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
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;

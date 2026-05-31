import { useState } from 'react';
import PropTypes from 'prop-types';
import { GoogleLogin } from '@react-oauth/google';
import './AuthModal.css';
import { setToken } from '../utils/auth';
import { getApiUrl, API_ENDPOINTS, isDemoMode } from '../utils/api';

const AuthModal = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isDemoMode()) {
            // Mock authentication for Demo Mode
            const username = formData.username || formData.email.split('@')[0] || 'demo_kullanici';
            const mockUser = {
                _id: 'demo_user_' + Date.now(),
                name: username.charAt(0).toUpperCase() + username.slice(1),
                username: username,
                bio: 'Heyyu2 ses dünyasına hoş geldiniz! 🎙️ Sesinle dünyayı değiştir!',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                stats: { posts: 0, listens: 0, averageListens: 0 }
            };
            
            localStorage.setItem('heyyu2_demo_user', JSON.stringify(mockUser));
            setToken('mock_demo_token');
            
            setTimeout(() => {
                onSuccess(mockUser);
                setLoading(false);
            }, 600);
            return;
        }

        try {
            const endpoint = isLogin ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await fetch(getApiUrl(endpoint), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                onSuccess(data.user);
            } else {
                setError(data.error || 'Giriş başarısız oldu');
            }
        } catch (err) {
            setError('Ağ hatası oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');

        if (isDemoMode()) {
            // Mock Google authentication for Demo Mode
            const mockUser = {
                _id: 'demo_user_google',
                name: 'Google Gezgini',
                username: 'google_gezgini',
                bio: 'Google ile giriş yapıldı 🌟 Sesinle dünyayı değiştir!',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
                stats: { posts: 0, listens: 0, averageListens: 0 }
            };
            
            localStorage.setItem('heyyu2_demo_user', JSON.stringify(mockUser));
            setToken('mock_demo_token');
            
            setTimeout(() => {
                onSuccess(mockUser);
                setLoading(false);
            }, 600);
            return;
        }

        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.GOOGLE_AUTH), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                })
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                onSuccess(data.user);
            } else {
                setError(data.error || 'Google kimlik doğrulaması başarısız');
            }
        } catch (err) {
            setError('Google girişi başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google girişi başarısız oldu. Lütfen tekrar deneyin.');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 className="modal-title gradient-text">
                    {isLogin ? 'Tekrar Hoş Geldiniz' : 'HEYYU2\'ye Katılın'}
                </h2>
                <p className="modal-subtitle">
                    {isLogin ? 'Devam etmek için giriş yapın' : 'Hesabınızı oluşturun'}
                </p>

                {/* Google Sign-In Button */}
                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        size="large"
                        text={isLogin ? "signin_with" : "signup_with"}
                        width="100%"
                    />
                </div>

                <div className="divider">
                    <span>veya</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <input
                            type="text"
                            name="username"
                            placeholder="Kullanıcı Adı"
                            value={formData.username}
                            onChange={handleChange}
                            required={!isLogin}
                            autoComplete="username"
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        {loading ? 'Lütfen bekleyin...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
                    </button>
                </form>

                <p className="auth-toggle">
                    {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="toggle-btn"
                    >
                        {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                    </button>
                </p>
            </div>
        </div>
    );
};

AuthModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};

export default AuthModal;


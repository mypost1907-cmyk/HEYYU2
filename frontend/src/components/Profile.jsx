import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Profile.css';
import VoicePost from './VoicePost';
import { getToken, removeToken } from '../utils/auth';
import { getApiUrl, API_ENDPOINTS, isDemoMode } from '../utils/api';
import { getDemoPosts } from '../utils/demoService';

const Profile = ({ user, onLogout }) => {
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalListens: 0,
        totalPosts: 0,
        averageListens: 0
    });

    useEffect(() => {
        if (user) {
            fetchMyPosts();
        }
    }, [user]);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            
            if (isDemoMode()) {
                // Fetch local posts for the current demo user
                const allPosts = getDemoPosts();
                const userFilteredPosts = allPosts.filter(
                    post => post.userId && post.userId.username === user.username
                );
                setMyPosts(userFilteredPosts);
                calculateStats(userFilteredPosts);
            } else {
                // Online Mode
                const token = getToken();
                const response = await fetch(getApiUrl(`${API_ENDPOINTS.FEED}?userId=${user.id || user._id}`), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setMyPosts(data.posts);
                    calculateStats(data.posts);
                }
            }
        } catch (error) {
            console.error('Failed to fetch my posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (postsList) => {
        const totalListens = postsList.reduce((sum, post) => sum + (post.stats?.listens || 0), 0);
        const avgListens = postsList.length > 0 ? Math.round(totalListens / postsList.length) : 0;

        setStats({
            totalListens,
            totalPosts: postsList.length,
            averageListens: avgListens
        });
    };

    const handleLogout = () => {
        removeToken();
        if (onLogout) onLogout();
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="empty-state">
                    <p>Profil görüntülemek için giriş yapın</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-avatar">
                    <img src={user.avatar} alt={user.username} />
                </div>

                <h1>{user.name || `@${user.username}`}</h1>
                <span className="profile-handle" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    @{user.username}
                </span>
                {user.bio && <p className="profile-bio" style={{ marginTop: '8px' }}>{user.bio}</p>}

                <div className="profile-stats">
                    <div className="stat">
                        <span className="stat-value">{stats.totalPosts}</span>
                        <span className="stat-label">Ses</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{stats.totalListens}</span>
                        <span className="stat-label">Dinlenme</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{stats.averageListens}</span>
                        <span className="stat-label">Ortalama</span>
                    </div>
                </div>

                <button className="btn-logout" onClick={handleLogout}>
                    🚪 Çıkış Yap
                </button>
            </header>

            <div className="profile-content">
                <h3 className="section-title">Seslerim 🎙️</h3>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                ) : myPosts.length === 0 ? (
                    <div className="empty-state">
                        <p>Henüz ses paylaşmadınız. İlk sesinizi paylaşın! 🎤</p>
                    </div>
                ) : (
                    <>
                        {myPosts.map(post => (
                            <VoicePost key={post._id} post={post} autoPlay={false} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

Profile.propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func
};

export default Profile;


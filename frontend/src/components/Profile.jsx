import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Profile.css';
import VoicePost from './VoicePost';
import { getToken, removeToken } from '../utils/auth';

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
            calculateStats();
        }
    }, [user]);

    const fetchMyPosts = async () => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/posts/feed?userId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setMyPosts(data.posts);
            }
        } catch (error) {
            console.error('Failed to fetch my posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalListens = myPosts.reduce((sum, post) => sum + (post.listens || 0), 0);
        const avgListens = myPosts.length > 0 ? Math.round(totalListens / myPosts.length) : 0;

        setStats({
            totalListens,
            totalPosts: myPosts.length,
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

                <h1>{user.username}</h1>
                {user.bio && <p className="profile-bio">{user.bio}</p>}

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

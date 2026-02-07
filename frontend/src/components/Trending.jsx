import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Trending.css';
import VoicePost from './VoicePost';

const Trending = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('24h');

    useEffect(() => {
        fetchTrendingPosts();
    }, [timeframe]);

    const fetchTrendingPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/posts/trending?timeframe=${timeframe}`);
            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Failed to fetch trending posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trending-container">
            <header className="trending-header">
                <h1 className="gradient-text">🔥 Trendler</h1>
                <p className="trending-subtitle">En  çok dinlenen sesler</p>

                <div className="timeframe-selector">
                    <button
                        className={timeframe === '24h' ? 'active' : ''}
                        onClick={() => setTimeframe('24h')}
                    >
                        24 Saat
                    </button>
                    <button
                        className={timeframe === '7d' ? 'active' : ''}
                        onClick={() => setTimeframe('7d')}
                    >
                        7 Gün
                    </button>
                    <button
                        className={timeframe === '30d' ? 'active' : ''}
                        onClick={() => setTimeframe('30d')}
                    >
                        30 Gün
                    </button>
                </div>
            </header>

            <div className="trending-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Trendler yükleniyor...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <p>Henüz trend yok. İlk trend sen ol! 🌟</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post, index) => (
                            <div key={post._id} className="trending-item">
                                <div className="trending-rank">#{index + 1}</div>
                                <VoicePost post={post} autoPlay={false} />
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Trending;

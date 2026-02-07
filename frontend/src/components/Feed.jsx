import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Feed.css';
import VoicePost from './VoicePost';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/posts/feed?page=${page}&limit=10`);
            const data = await response.json();

            if (data.success) {
                setPosts(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading]);

    if (loading && posts.length === 0) {
        return (
            <div className="feed-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading vibes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-container">
            <header className="feed-header">
                <img src="/logo.svg" alt="HEYYU2" className="app-logo" />
                <h1 className="gradient-text">HEYYU2</h1>
                <p className="feed-tagline">Voice Social Platform</p>
            </header>

            <div className="feed-content">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts yet. Be the first to share! 🎙️</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post, index) => (
                            <VoicePost
                                key={post._id || index}
                                post={post}
                                autoPlay={index === 0}
                            />
                        ))}

                        {hasMore && (
                            <div ref={observerRef} className="load-more-trigger">
                                {loading && <div className="spinner"></div>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Feed;

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './VoicePost.css';
import Waveform from './Waveform';

const VoicePost = ({ post, autoPlay = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const postRef = useRef(null);

    // Auto-play when in view
    useEffect(() => {
        if (!autoPlay) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
                        // In view - play
                        handlePlay();
                    } else if (isPlaying) {
                        // Out of view - pause
                        handlePause();
                    }
                });
            },
            { threshold: 0.7 }
        );

        if (postRef.current) {
            observer.observe(postRef.current);
        }

        return () => observer.disconnect();
    }, [autoPlay]);

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);

            // Track listen
            trackListen();
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const trackListen = async () => {
        try {
            await fetch(`http://localhost:5000/api/posts/${post._id}/listen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: false })
            });
        } catch (error) {
            console.error('Failed to track listen:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get current word for subtitles
    const getCurrentWord = () => {
        if (!post.transcript?.words?.length) return post.transcript?.text || '';

        const currentWord = post.transcript.words.find(
            (word) => currentTime * 1000 >= word.startTime && currentTime * 1000 <= word.endTime
        );

        return currentWord?.word || '';
    };

    const userData = post.userId || {};
    const username = post.isAnonymous ? 'Anonymous' : (userData.username || 'Unknown');
    const avatar = post.isAnonymous
        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
        : (userData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default');

    return (
        <div className="voice-post" ref={postRef}>
            <div className="post-header">
                <img src={avatar} alt={username} className="avatar" />
                <div className="post-user-info">
                    <h3 className="username">{username}</h3>
                    <p className="post-time">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {post.isAnonymous && (
                    <span className="anonymous-badge">🎭 Anonymous</span>
                )}
            </div>

            <div className="post-content">
                {/* Waveform */}
                <Waveform
                    data={post.waveformData || []}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={post.duration / 1000}
                />

                {/* Audio Controls */}
                <div className="audio-controls">
                    <button
                        className="play-button"
                        onClick={isPlaying ? handlePause : handlePlay}
                    >
                        {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <div className="time-info">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(post.duration / 1000)}</span>
                    </div>
                </div>

                {/* Live Subtitles */}
                {isPlaying && (
                    <div className="live-subtitle">
                        {getCurrentWord()}
                    </div>
                )}

                {/* Transcript (when paused) */}
                {!isPlaying && post.transcript?.text && (
                    <p className="transcript-text">{post.transcript.text}</p>
                )}
            </div>

            {/* Stats & Actions */}
            <div className="post-footer">
                <div className="post-stats">
                    <span>👂 {post.stats?.listens || 0}</span>
                    <span>💬 {post.stats?.replyCount || 0}</span>
                    <span>🔥 {post.stats?.reactionCounts?.fire || 0}</span>
                </div>
                <div className="post-actions">
                    <button className="action-btn">💬 Reply</button>
                    <button className="action-btn">🔥 React</button>
                    <button className="action-btn">🔄 Duet</button>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={`http://localhost:5000${post.audioUrl}`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
            />
        </div>
    );
};

VoicePost.propTypes = {
    post: PropTypes.object.isRequired,
    autoPlay: PropTypes.bool
};

export default VoicePost;

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './VoicePost.css';
import Waveform from './Waveform';
import { getApiUrl, API_ENDPOINTS, isDemoMode } from '../utils/api';
import { playDemoSpeech, stopDemoSpeech, toggleDemoLike, trackDemoListen } from '../utils/demoService';

const VoicePost = ({ post, autoPlay = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [localLikes, setLocalLikes] = useState(post.stats?.reactionCounts?.fire || 0);
    const [localLiked, setLocalLiked] = useState(post.liked || false);
    const [localListens, setLocalListens] = useState(post.stats?.listens || 0);
    const [activeSubtitle, setActiveSubtitle] = useState('');
    
    const audioRef = useRef(null);
    const postRef = useRef(null);
    const ttsTimerRef = useRef(null);

    // Sync state if post prop changes
    useEffect(() => {
        setLocalLikes(post.stats?.reactionCounts?.fire || 0);
        setLocalLiked(post.liked || false);
        setLocalListens(post.stats?.listens || 0);
    }, [post]);

    // Auto-play when in view
    useEffect(() => {
        if (!autoPlay) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
                        handlePlay();
                    } else if (isPlaying) {
                        handlePause();
                    }
                });
            },
            { threshold: 0.7 }
        );

        if (postRef.current) {
            observer.observe(postRef.current);
        }

        return () => {
            observer.disconnect();
            if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
        };
    }, [autoPlay, isPlaying]);

    // Cleanup active TTS speech/timer on unmount
    useEffect(() => {
        return () => {
            if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
        };
    }, []);

    const handlePlay = () => {
        // Clear existing TTS timers just in case
        if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);

        const isMockPost = post.audioUrl && post.audioUrl.startsWith('mock_');

        if (isDemoMode() && isMockPost) {
            // TTS Playback for Demo Mock Posts
            setIsPlaying(true);
            setActiveSubtitle('');
            
            // Increment local listens
            trackDemoListen(post._id);
            setLocalListens(prev => prev + 1);

            const isTtsActive = playDemoSpeech(
                post,
                (word) => {
                    setActiveSubtitle(word);
                },
                () => {
                    handleEnded();
                },
                () => {
                    handleEnded();
                }
            );

            if (isTtsActive) {
                // Synthesize progress ticker matching post duration
                const durationSec = post.duration / 1000;
                let current = 0;
                ttsTimerRef.current = setInterval(() => {
                    current += 0.1;
                    if (current >= durationSec) {
                        clearInterval(ttsTimerRef.current);
                        setCurrentTime(durationSec);
                        handleEnded();
                    } else {
                        setCurrentTime(current);
                    }
                }, 100);
            }
        } else {
            // Standard Audio Tag Playback for real audio files
            if (audioRef.current) {
                // Pause all other audios/TTS first
                stopDemoSpeech();
                
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        trackListen();
                    })
                    .catch(err => console.error('Audio play failed:', err));
            }
        }
    };

    const handlePause = () => {
        const isMockPost = post.audioUrl && post.audioUrl.startsWith('mock_');

        if (isDemoMode() && isMockPost) {
            stopDemoSpeech();
            if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
            setIsPlaying(false);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
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
        setActiveSubtitle('');
        if (ttsTimerRef.current) clearInterval(ttsTimerRef.current);
    };

    const trackListen = async () => {
        setLocalListens(prev => prev + 1);
        if (isDemoMode()) {
            trackDemoListen(post._id);
            return;
        }

        try {
            await fetch(getApiUrl(API_ENDPOINTS.POST_LISTEN(post._id)), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to track listen:', error);
        }
    };

    const handleLikeClick = async () => {
        if (isDemoMode()) {
            toggleDemoLike(post._id);
            setLocalLiked(!localLiked);
            setLocalLikes(prev => localLiked ? prev - 1 : prev + 1);
            return;
        }

        // Live API reaction call
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('/api/reactions'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetType: 'VoicePost',
                    targetId: post._id,
                    type: 'fire'
                })
            });

            if (response.ok) {
                setLocalLiked(!localLiked);
                setLocalLikes(prev => localLiked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error('Failed to toggle reaction:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get current word for subtitles (Live audio file playback support)
    const getCurrentWord = () => {
        if (isDemoMode() && post.audioUrl && post.audioUrl.startsWith('mock_')) {
            return activeSubtitle || post.transcript?.text || '';
        }

        if (!post.transcript?.words?.length) return post.transcript?.text || '';

        const currentWord = post.transcript.words.find(
            (word) => currentTime * 1000 >= word.startTime && currentTime * 1000 <= word.endTime
        );

        return currentWord?.word || '';
    };

    const userData = post.userId || {};
    const username = post.isAnonymous ? 'Anonymous' : (userData.username ? `@${userData.username}` : '@unknown');
    const displayName = post.isAnonymous ? '🎭 Anonim' : (userData.name || 'Bilinmeyen Kullanıcı');
    const avatar = post.isAnonymous
        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
        : (userData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default');

    return (
        <div className="voice-post" ref={postRef}>
            <div className="post-header">
                <img src={avatar} alt={username} className="avatar" />
                <div className="post-user-info">
                    <h3 className="username">
                        {displayName}
                        {['Cem Yılmaz', 'Tarkan', 'Elon Musk', 'Gökhan'].includes(displayName) && (
                            <span className="verified-badge" style={{ color: '#7c3aed', marginLeft: '5px' }}>✓</span>
                        )}
                    </h3>
                    <span className="post-user-handle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {username}
                    </span>
                    <p className="post-time" style={{ marginTop: '2px' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {post.isAnonymous && (
                    <span className="anonymous-badge">🎭 Anonim</span>
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
                        className={`play-button ${isPlaying ? 'playing' : ''}`}
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
                    <div className="live-subtitle" style={{ color: 'var(--color-primary)', fontWeight: 'bold', margin: '0.5rem 0', minHeight: '1.5rem', textAlign: 'center' }}>
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
                    <span>👂 {localListens}</span>
                    <span>💬 {post.stats?.replyCount || 0}</span>
                    <span>🔥 {localLikes}</span>
                </div>
                <div className="post-actions">
                    <button className="action-btn" onClick={() => alert('Sesli yorumlar yakında aktif olacak! 🎙️')}>💬 Yorum</button>
                    <button className={`action-btn ${localLiked ? 'active' : ''}`} onClick={handleLikeClick}>
                        🔥 {localLiked ? 'Beğenildi' : 'Beğen'}
                    </button>
                    <button className="action-btn" onClick={() => alert('Düet özelliği çok yakında! 🔄')}>🔄 Düet</button>
                </div>
            </div>

            {/* Hidden Audio Element (only loaded/used for non-mock audio URLs) */}
            {post.audioUrl && !post.audioUrl.startsWith('mock_') && (
                <audio
                    ref={audioRef}
                    src={post.audioUrl.startsWith('blob:') ? post.audioUrl : API_ENDPOINTS.AUDIO_FILE(post.audioUrl)}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    preload="metadata"
                />
            )}
        </div>
    );
};

VoicePost.propTypes = {
    post: PropTypes.object.isRequired,
    autoPlay: PropTypes.bool
};

export default VoicePost;


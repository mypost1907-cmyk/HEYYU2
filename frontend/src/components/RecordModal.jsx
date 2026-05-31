import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './RecordModal.css';
import { getApiUrl, API_ENDPOINTS, isDemoMode } from '../utils/api';
import { addDemoPost } from '../utils/demoService';

const RecordModal = ({ onClose, onSuccess }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedEffect, setSelectedEffect] = useState('normal');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    const MAX_DURATION = 12; // seconds

    useEffect(() => {
        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'tr-TR'; // Turkish

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptPiece + ' ';
                    } else {
                        interimTranscript += transcriptPiece;
                    }
                }

                setTranscript(finalTranscript || interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError('');

            // Start speech recognition
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }

            // Start timer
            let seconds = 0;
            timerRef.current = setInterval(() => {
                seconds++;
                setDuration(seconds);

                if (seconds >= MAX_DURATION) {
                    stopRecording();
                }
            }, 1000);

        } catch (err) {
            setError('Mikrofon izni gerekli. Lütfen tarayıcı ayarlarından izin verin.');
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handlePost = async () => {
        if (!audioBlob) {
            setError('Önce ses kaydı yapın');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            if (isDemoMode()) {
                // Demo Mode Local Save Integration
                const newPost = addDemoPost(
                    audioBlob,
                    duration || 5, // fallback duration
                    transcript || 'Yeni bir ses paylaştı 🎙️',
                    selectedEffect,
                    isAnonymous
                );
                
                // Simulate network latency
                setTimeout(() => {
                    onSuccess(newPost);
                    onClose();
                    setIsProcessing(false);
                }, 800);
                return;
            }

            // Online Mode Server Upload
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice-post.webm');
            formData.append('duration', duration * 1000); // convert to ms
            formData.append('transcript', transcript);
            formData.append('isAnonymous', isAnonymous);
            formData.append('effect', selectedEffect);

            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_POST), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess(data.post);
                onClose();
            } else {
                setError(data.error || 'Post oluşturulamadı');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            console.error('Error posting:', err);
        } finally {
            if (!isDemoMode()) {
                setIsProcessing(false);
            }
        }
    };

    const handleDiscard = () => {
        setAudioBlob(null);
        setDuration(0);
        setTranscript('');
        setSelectedEffect('normal');
        audioChunksRef.current = [];
    };

    const effects = [
        { id: 'normal', name: 'Normal', icon: '🎤' },
        { id: 'robot', name: 'Robot', icon: '🤖' },
        { id: 'echo', name: 'Yankı', icon: '🎵' },
        { id: 'chipmunk', name: 'Tiz', icon: '🐿️' },
        { id: 'deep', name: 'Kalın', icon: '🦍' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content record-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 className="modal-title gradient-text">
                    🎙️ Sesini Duyur
                </h2>

                {/* Recording Controls */}
                <div className="record-controls">
                    {!audioBlob ? (
                        <>
                            <div className="record-indicator">
                                <button
                                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                                    onClick={isRecording ? stopRecording : startRecording}
                                >
                                    {isRecording ? '⏹️' : '🎤'}
                                </button>
                            </div>

                            <div className="timer">
                                {duration}/{MAX_DURATION}s
                            </div>

                            {isRecording && (
                                <div className="recording-wave">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="playback-controls">
                            <audio src={URL.createObjectURL(audioBlob)} controls />
                            
                            {/* Voice Effects Panel */}
                            <div className="effects-selector">
                                <h4>Ses Efekti Seç:</h4>
                                <div className="effects-grid">
                                    {effects.map((eff) => (
                                        <button
                                            key={eff.id}
                                            className={`effect-btn ${selectedEffect === eff.id ? 'active' : ''}`}
                                            onClick={() => setSelectedEffect(eff.id)}
                                        >
                                            {eff.icon} {eff.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-secondary" onClick={handleDiscard}>
                                🗑️ Yeniden Kaydet
                            </button>
                        </div>
                    )}
                </div>

                {/* Live Transcript */}
                {transcript && (
                    <div className="transcript-box">
                        <h4>Transkript:</h4>
                        <p>{transcript}</p>
                    </div>
                )}

                {/* Options */}
                <div className="post-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <span>Anonim olarak paylaş</span>
                    </label>
                </div>

                {/* Error Message */}
                {error && <p className="error-message">{error}</p>}

                {/* Action Buttons */}
                {audioBlob && (
                    <button
                        className="btn-primary"
                        onClick={handlePost}
                        disabled={isProcessing}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {isProcessing ? 'Paylaşılıyor...' : '📤 Paylaş ✨'}
                    </button>
                )}

                {/* Instructions */}
                {!isRecording && !audioBlob && (
                    <div className="instructions">
                        <p>🎤 Mikrofon butonuna basarak kayda başlayın</p>
                        <p>⏱️ Maksimum {MAX_DURATION} saniye</p>
                        <p>🗣️ Konuşurken otomatik transkript oluşur</p>
                    </div>
                )}
            </div>
        </div>
    );
};

RecordModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};

export default RecordModal;


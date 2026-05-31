// HEYYU2 Demo Mode Service
// Manages local state, Speech Synthesis playback, voice effects, and localStorage persistence.

const STORAGE_KEYS = {
    POSTS: 'heyyu2_demo_posts',
    USER: 'heyyu2_demo_user',
    LIKES: 'heyyu2_demo_likes',
};

const MOCK_USERS = [
    { name: 'Cem Yılmaz', username: 'cmylmz', bio: 'Komedyen, Aktör, Karikatürist 🎙️', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cem', gender: 'male' },
    { name: 'Tarkan', username: 'tarkan', bio: 'Megastar 🎵 Müzik ruhun gıdasıdır.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tarkan', gender: 'male' },
    { name: 'Elon Musk', username: 'elonmusk', bio: 'Mars & Cars 🚀 Chief Engineer at SpaceX.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elon', gender: 'male' },
    { name: 'Sezen Aksu', username: 'sezen', bio: 'Minik Serçe 🕊️ Şarkı söylemek lazım avaz avaz.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sezen', gender: 'female' },
    { name: 'Fatih Terim', username: 'imparator', bio: 'Vazgeçtiğimiz an biteriz! ⚽', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=terim', gender: 'male' },
    { name: 'Acun Ilıcalı', username: 'acun', bio: 'Girişimci, TV Yapımcısı. Hayallerinin peşinden git! ✨', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=acun', gender: 'male' },
];

const SAMPLE_POSTS = [
    {
        transcript: 'Yeni projemiz üzerinde çalışıyoruz, çok yakında harika bir filmle karşınızdayız! Hazır olun #sinema #komedi',
        userIndex: 0,
        effect: 'chipmunk',
    },
    {
        transcript: 'Bu akşam harika bir konser vardı, enerjiniz gerçekten müthişti! Hepinizi çok seviyorum #müzik #konser',
        userIndex: 1,
        effect: 'echo',
    },
    {
        transcript: 'Mars yolculuğu için biletler çok yakında hazır. Kimler benimle uzaya gelmek istiyor? 🚀 #space #mars',
        userIndex: 2,
        effect: 'robot',
    },
    {
        transcript: 'Hayat bazen tatlı bazen hüzünlü... Şarkılarımda kendinizi bulmanız dileğiyle ✨ #sezen #müzik',
        userIndex: 3,
        effect: 'normal',
    },
    {
        transcript: 'Biz bitti demeden bitmez! Takım ruhu, inanç ve azim bizi her zaman zafere götürür #futbol #millitakım',
        userIndex: 4,
        effect: 'deep',
    },
    {
        transcript: 'Survivor bu akşam efsane bir bölümle geliyor! Hazır mısınız? Kim elenecek acaba? 🤔 #survivor #tv8',
        userIndex: 5,
        effect: 'normal',
    }
];

// Generates simulated waveform heights
const generateWaveformData = (count = 40) => {
    return Array.from({ length: count }, () => Math.random() * 0.8 + 0.2);
};

export const initDemoData = () => {
    // Check if user exists, else initialize
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        const defaultUser = {
            _id: 'demo_user_gokhan',
            name: 'Gökhan',
            username: 'gokhan',
            bio: 'Sesinle dünyayı değiştir! 🎙️ Kurucu @heyyu',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gokhan',
            cover: 'linear-gradient(to right, #7c3aed, #ec4899)',
            stats: {
                posts: 0,
                listens: 1240,
                averageListens: 205
            }
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    }

    // Check if posts exist, else initialize with samples
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        const posts = SAMPLE_POSTS.map((sample, idx) => {
            const user = MOCK_USERS[sample.userIndex];
            const timeAgo = (idx + 1) * 3600000; // hours ago
            return {
                _id: `mock_post_${idx}_${Date.now()}`,
                userId: {
                    _id: `mock_user_${sample.userIndex}`,
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar,
                    gender: user.gender
                },
                audioUrl: `mock_audio_${idx}`,
                duration: 8000 + Math.floor(Math.random() * 4000), // ms
                waveformData: generateWaveformData(),
                transcript: {
                    text: sample.transcript,
                    words: sample.transcript.split(' ').map((word, wIdx) => ({
                        word,
                        startTime: wIdx * 400,
                        endTime: (wIdx + 1) * 400
                    }))
                },
                isAnonymous: false,
                effect: sample.effect,
                createdAt: new Date(Date.now() - timeAgo).toISOString(),
                stats: {
                    listens: 100 + Math.floor(Math.random() * 900),
                    replyCount: Math.floor(Math.random() * 12),
                    reactionCounts: {
                        fire: Math.floor(Math.random() * 45)
                    }
                },
                isDemo: true
            };
        });
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        updateUserStats();
    }
};

export const getDemoUser = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
};

export const updateDemoUser = (updatedFields) => {
    const user = getDemoUser();
    const newUser = { ...user, ...updatedFields };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return newUser;
};

export const getDemoPosts = () => {
    initDemoData();
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getTrendingPosts = (timeframe) => {
    const posts = getDemoPosts();
    // Simulate trending ordering by sorting based on listens + fires
    return [...posts].sort((a, b) => {
        const scoreA = (a.stats?.listens || 0) + (a.stats?.reactionCounts?.fire || 0) * 5;
        const scoreB = (b.stats?.listens || 0) + (b.stats?.reactionCounts?.fire || 0) * 5;
        return scoreB - scoreA;
    });
};

export const addDemoPost = (audioBlob, durationSeconds, transcriptText, effect = 'normal', isAnonymous = false) => {
    const posts = getDemoPosts();
    const user = getDemoUser();

    // Create a local audio URL for the uploaded audio
    const audioUrl = URL.createObjectURL(audioBlob);

    const newPost = {
        _id: `user_post_${Date.now()}`,
        userId: isAnonymous ? {
            _id: 'anonymous',
            name: 'Anonymous',
            username: 'anonymous',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
        } : {
            _id: user._id,
            name: user.name,
            username: user.username,
            avatar: user.avatar
        },
        audioUrl: audioUrl,
        duration: durationSeconds * 1000,
        waveformData: generateWaveformData(),
        transcript: {
            text: transcriptText || 'Yeni ses kaydı 🎙️ #heyyu',
            words: (transcriptText || 'Yeni ses kaydı').split(' ').map((word, wIdx) => ({
                word,
                startTime: wIdx * 300,
                endTime: (wIdx + 1) * 300
            }))
        },
        isAnonymous,
        effect,
        createdAt: new Date().toISOString(),
        stats: {
            listens: 0,
            replyCount: 0,
            reactionCounts: {
                fire: 0
            }
        },
        isDemo: true,
        localAudioBlob: audioBlob // Keep raw blob if needed
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    updateUserStats();
    return newPost;
};

export const toggleDemoLike = (postId) => {
    const posts = getDemoPosts();
    const post = posts.find(p => p._id === postId);
    if (post) {
        if (!post.stats.reactionCounts) post.stats.reactionCounts = { fire: 0 };
        if (post.liked) {
            post.liked = false;
            post.stats.reactionCounts.fire = Math.max(0, post.stats.reactionCounts.fire - 1);
        } else {
            post.liked = true;
            post.stats.reactionCounts.fire++;
        }
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
    return post;
};

export const trackDemoListen = (postId) => {
    const posts = getDemoPosts();
    const post = posts.find(p => p._id === postId);
    if (post) {
        post.stats.listens = (post.stats.listens || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
    return post;
};

const updateUserStats = () => {
    const user = getDemoUser();
    if (!user) return;

    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
    const myPosts = posts.filter(p => p.userId && p.userId.username === user.username);
    
    user.stats.posts = myPosts.length;
    user.stats.listens = myPosts.reduce((sum, p) => sum + (p.stats?.listens || 0), 1240);
    user.stats.averageListens = myPosts.length > 0 ? Math.round(user.stats.listens / myPosts.length) : 205;

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// --- Web Speech API Speech Synthesis Playback for Mock Posts ---
let activeSpeechUtterance = null;

export const playDemoSpeech = (post, onBoundary, onEnd, onError) => {
    if (!window.speechSynthesis) {
        if (onError) onError('Speech synthesis not supported');
        return;
    }

    // Stop active synthesis
    window.speechSynthesis.cancel();
    activeSpeechUtterance = null;

    // Check if post actually has a local audio URL from MediaRecorder (user recorded it)
    if (post.audioUrl && post.audioUrl.startsWith('blob:')) {
        // This is a real audio recording, we play it directly in the audio tag
        // No TTS required for this! Return false so VoicePost plays it via HTML5 Audio
        return false;
    }

    const text = post.transcript?.text || '';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';

    // Apply pitch and speed effects based on chosen effect
    switch (post.effect) {
        case 'robot':
            utterance.pitch = 0.5;
            utterance.rate = 0.95;
            break;
        case 'chipmunk':
            utterance.pitch = 1.7;
            utterance.rate = 1.25;
            break;
        case 'deep':
            utterance.pitch = 0.45;
            utterance.rate = 0.8;
            break;
        case 'echo':
            // Slower rate simulates echo/reflective delay
            utterance.pitch = 0.85;
            utterance.rate = 0.65;
            break;
        default:
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
    }

    // Assign gender-based voices for realism
    const voices = window.speechSynthesis.getVoices();
    const trVoices = voices.filter(v => v.lang.includes('tr'));
    let selectedVoice = null;

    if (post.userId?.gender === 'female') {
        selectedVoice = trVoices.find(v => v.name.includes('Female') || v.name.includes('Kadın') || v.name.includes('Zira') || v.name.includes('Emel'));
    } else {
        selectedVoice = trVoices.find(v => v.name.includes('Male') || v.name.includes('Erkek') || v.name.includes('Tolga') || v.name.includes('David'));
    }

    if (!selectedVoice) selectedVoice = trVoices[0]; // Fallback to any Turkish voice
    if (selectedVoice) utterance.voice = selectedVoice;

    // Track word boundaries for subtitle highlighting
    utterance.onboundary = (event) => {
        if (event.name === 'word' && onBoundary) {
            const words = text.substring(event.charIndex).split(' ');
            if (words.length > 0) {
                onBoundary(words[0]);
            }
        }
    };

    utterance.onend = () => {
        activeSpeechUtterance = null;
        if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
        activeSpeechUtterance = null;
        if (onError) onError(e);
    };

    activeSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true; // Confirms speech synthesis is playing
};

export const stopDemoSpeech = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    activeSpeechUtterance = null;
};

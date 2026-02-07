// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};

export const API_ENDPOINTS = {
    // Auth
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    GOOGLE_AUTH: '/api/auth/google',
    ME: '/api/auth/me',

    // Posts
    FEED: '/api/posts/feed',
    TRENDING: '/api/posts/trending',
    CREATE_POST: '/api/posts',
    POST_LISTEN: (id) => `/api/posts/${id}/listen`,

    // Audio
    AUDIO_FILE: (audioUrl) => `${API_BASE_URL}${audioUrl}`,
};

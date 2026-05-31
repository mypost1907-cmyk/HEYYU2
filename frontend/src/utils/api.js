// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let demoMode = true; // Default to demo mode for safety (fallback)

export const isDemoMode = () => demoMode;

export const setDemoMode = (value) => {
    demoMode = value;
};

export const checkBackendHealth = async () => {
    if (!import.meta.env.VITE_API_URL) {
        // No VITE_API_URL provided, default to Demo Mode directly
        demoMode = true;
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
            demoMode = false;
            return true;
        }
    } catch (e) {
        console.warn('Backend offline, running in Demo Mode:', e);
    }
    
    demoMode = true;
    return false;
};

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


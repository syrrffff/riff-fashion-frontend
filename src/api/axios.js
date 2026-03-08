import axios from 'axios';

const instance = axios.create({
    // 1. HAPUS + '/api' karena di Vercel/env sudah Anda tuliskan /api
    baseURL: import.meta.env.VITE_API_BASE_URL,

    headers: {
        // 2. WAJIB DIAKTIFKAN! Agar Vercel bisa menembus layar biru ngrok
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
    }
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;

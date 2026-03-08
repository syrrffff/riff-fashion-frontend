import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
    // --- TAMBAHKAN HEADERS INI ---
    headers: {
        // 'ngrok-skip-browser-warning': 'true', // Bebas diisi apa saja, yang penting header ini ada
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

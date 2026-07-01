import axios from 'axios';

const API_BASE_URL = import.meta.env.PUBLIC_IAM_API_URL || 
    (import.meta.env.PROD ? 'https://iam-core.onrender.com/api/v1' : 'http://127.0.0.1:8000/api/v1');

const iamApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para inyectar el token automáticamente en cada petición
iamApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default iamApi;
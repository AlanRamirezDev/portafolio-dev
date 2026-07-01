import axios from 'axios';

const iamApi = axios.create({
    baseURL: 'https://iam-core.onrender.com/api/v1',
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
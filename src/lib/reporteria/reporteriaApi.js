import axios from 'axios';

const API_BASE_URL = import.meta.env.PUBLIC_REPORTERIA_API_URL || 
    (import.meta.env.PROD ? 'https://api-reporteria.onrender.com/api/v1' : 'http://localhost:8000/api/v1');

const reporteriaApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 100000, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default reporteriaApi;
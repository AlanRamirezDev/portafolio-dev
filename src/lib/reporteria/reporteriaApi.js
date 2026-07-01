import axios from 'axios';

const API_BASE_URL = import.meta.env.PUBLIC_REPORTERIA_API_URL || 
    (import.meta.env.PROD ? 'https://api-reporteria.onrender.com' : 'http://localhost:8000/api');

const reporteriaApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default reporteriaApi;
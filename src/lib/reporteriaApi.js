import axios from 'axios';

const reporteriaApi = axios.create({
    baseURL: import.meta.env.PUBLIC_REPORTERIA_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default reporteriaApi;
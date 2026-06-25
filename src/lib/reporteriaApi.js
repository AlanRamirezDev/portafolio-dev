import axios from 'axios';

const reporteriaApi = axios.create({
    // Cambiar después
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default reporteriaApi;
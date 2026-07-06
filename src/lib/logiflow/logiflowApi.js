import axios from 'axios';

const logiflowApi = axios.create({
    baseURL: import.meta.env.PROD 
        ? 'https://logiflow-api-fx7o.onrender.com/api/v1/etl'
        : 'http://localhost:8081/api/v1/etl',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default logiflowApi;
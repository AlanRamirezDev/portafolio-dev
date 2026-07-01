export const API_BASE_URL = import.meta.env.PUBLIC_MOTOR_INVERSIONES_API_URL || 
    (import.meta.env.PROD ? 'https://motor-inversiones-api.onrender.com' : 'http://localhost:8080');
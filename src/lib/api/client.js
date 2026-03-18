import axios from 'axios';
import { ENDPOINTS } from './endpoints';

// Create axios instance
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        // Client-side access to token (naive implementation, better to use context/hook injection usually, 
        // but for axios instance we might need to rely on localStorage if not passed explicitly)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Log all errors with detailed information
        if (error.response) {
            // Server responded with error status
            const errorInfo = {
                timestamp: new Date().toISOString(),
                method: originalRequest?.method?.toUpperCase(),
                url: originalRequest?.url,
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                requestBody: originalRequest?.data,
                headers: {
                    'Content-Type': error.response.headers['content-type'],
                    'Server': error.response.headers['server']
                }
            };
            
            // Log 5xx errors more prominently
            if (error.response.status >= 500) {
                console.error('[API Error - Server Error]', errorInfo);
            } else {
                console.debug('[API Error]', errorInfo);
            }
        } else if (error.request) {
            // Request made but no response
            console.error('[API Error - No Response]', {
                message: 'No response from server',
                method: originalRequest?.method?.toUpperCase(),
                url: originalRequest?.url,
                timestamp: new Date().toISOString()
            });
        } else {
            // Error during request setup
            console.error('[API Error - Request Setup]', {
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                // No refresh token, logout
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(ENDPOINTS.AUTH.REFRESH, {
                    refresh_token: refreshToken,
                });

                const { access_token } = response.data.data;

                localStorage.setItem('access_token', access_token);

                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
                originalRequest.headers['Authorization'] = 'Bearer ' + access_token;

                processQueue(null, access_token);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

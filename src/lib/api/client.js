import axios from 'axios';
import { ENDPOINTS } from './endpoints';

// Create axios instance
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
    // Important: withCredentials ensures cookies are sent even if cross-origin,
    // but since API_BASE is /api-proxy, they are same-origin anyway.
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            if (error.response.status >= 500) {
                console.error('[API Error - Server Error]', error.response.data);
            } else {
                console.debug('[API Error]', error.response.data);
            }
        }

        // If the error is 401 Unauthorized and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite refresh loops on the refresh endpoint itself
            if (originalRequest.url === ENDPOINTS.AUTH.REFRESH) {
                if (typeof window !== 'undefined') {
                    document.cookie = 'user=; Max-Age=0; path=/;';
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // The cookie was updated automatically by the browser
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call our Next.js BFF refresh endpoint. 
                // The browser automatically attaches the HttpOnly refresh_token cookie.
                await axios.post(ENDPOINTS.AUTH.REFRESH, {}, { withCredentials: true });

                // If successful, the BFF set a new HttpOnly access_token cookie.
                processQueue(null);
                isRefreshing = false;

                // Retry the original request. The browser will attach the new cookie.
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err);
                isRefreshing = false;
                
                // Refresh failed, force logout
                if (typeof window !== 'undefined') {
                    // Call BFF logout to clear cookies
                    await axios.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export const authService = {
    login: async (email, password) => {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
        return data;
    },

    logout: async (refreshToken) => {
        try {
            if (refreshToken) {
                await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken });
            }
        } finally {
            // Always cleanup local storage even if API fails
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
            }
        }
    },

    refresh: async (refreshToken) => {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
        return data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            current_password: currentPassword,
            new_password: newPassword
        });
        return data;
    }
};

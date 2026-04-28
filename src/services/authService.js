import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export const authService = {
    login: async (email, password) => {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
        return data;
    },

    logout: async () => {
        try {
            await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    },

    refresh: async () => {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.REFRESH);
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

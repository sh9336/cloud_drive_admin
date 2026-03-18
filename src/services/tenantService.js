import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export const tenantService = {
    list: async () => {
        const { data } = await apiClient.get(ENDPOINTS.TENANTS.LIST);
        return data;
    },

    create: async (payload) => {
        const { data } = await apiClient.post(ENDPOINTS.TENANTS.CREATE, payload);
        return data;
    },

    get: async (id) => {
        const { data } = await apiClient.get(ENDPOINTS.TENANTS.GET(id));
        return data;
    },

    updateStatus: async (id, isActive, reason) => {
        const { data } = await apiClient.patch(ENDPOINTS.TENANTS.UPDATE_STATUS(id), {
            is_active: isActive,
            disabled_reason: reason
        });
        return data;
    },

    resetPassword: async (id) => {
        const { data } = await apiClient.post(ENDPOINTS.TENANTS.RESET_PASSWORD(id));
        return data;
    },

    getSyncTokens: async (id) => {
        const { data } = await apiClient.get(ENDPOINTS.TENANTS.SYNC_TOKENS(id));
        return data;
    },

    delete: async (id) => {
        const { data } = await apiClient.delete(ENDPOINTS.TENANTS.DELETE(id));
        return data;
    },
};

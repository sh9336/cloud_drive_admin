import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export const syncTokenService = {
    list: async () => {
        const { data } = await apiClient.get(ENDPOINTS.SYNC_TOKENS.LIST);
        return data;
    },

    create: async (payload) => {
        const { data } = await apiClient.post(ENDPOINTS.SYNC_TOKENS.CREATE, payload);
        return data;
    },

    get: async (id) => {
        const { data } = await apiClient.get(ENDPOINTS.SYNC_TOKENS.GET(id));
        return data;
    },

    rotate: async (id, expiresInDays, gracePeriodDays) => {
        const { data } = await apiClient.post(ENDPOINTS.SYNC_TOKENS.ROTATE(id), {
            token_id: id,
            expires_in_days: expiresInDays,
            grace_period_days: gracePeriodDays
        });
        return data;
    },

    revoke: async (id, reason) => {
        const { data } = await apiClient.delete(ENDPOINTS.SYNC_TOKENS.REVOKE(id), {
            data: { reason } // DELETE body usually needs explicit data config in axios often
        });
        return data;
    },

    getStats: async (id) => {
        const { data } = await apiClient.get(ENDPOINTS.SYNC_TOKENS.STATS(id));
        return data;
    },

    deletePermanent: async (id) => {
        const { data } = await apiClient.delete(ENDPOINTS.SYNC_TOKENS.DELETE(id));
        return data;
    },

    cleanupRevoked: async () => {
        const { data } = await apiClient.delete(ENDPOINTS.SYNC_TOKENS.CLEANUP);
        return data;
    }
};

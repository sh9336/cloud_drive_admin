import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export const auditLogService = {
    list: async (params) => {
        const { data } = await apiClient.get(ENDPOINTS.AUDIT_LOGS.LIST, { params });
        return data;
    },

    rotate: async (days) => {
        const { data } = await apiClient.post(ENDPOINTS.AUDIT_LOGS.ROTATE(days));
        return data;
    },
};

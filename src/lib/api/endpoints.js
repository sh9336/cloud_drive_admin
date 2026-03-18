const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE}/auth/admin/login`,
        REFRESH: `${API_BASE}/auth/refresh`,
        LOGOUT: `${API_BASE}/auth/logout`,
        CHANGE_PASSWORD: `${API_BASE}/admin/change_password`,
    },
    TENANTS: {
        LIST: `${API_BASE}/admin/tenants`,
        CREATE: `${API_BASE}/admin/tenants`,
        GET: (id) => `${API_BASE}/admin/tenants/${id}`,
        RESET_PASSWORD: (id) => `${API_BASE}/admin/tenants/${id}/reset-password`,
        UPDATE_STATUS: (id) => `${API_BASE}/admin/tenants/${id}/status`,
        SYNC_TOKENS: (id) => `${API_BASE}/admin/tenants/${id}/sync-tokens`,
        DELETE: (id) => `${API_BASE}/admin/tenants/${id}`,
    },
    SYNC_TOKENS: {
        LIST: `${API_BASE}/admin/sync-tokens`,
        CREATE: `${API_BASE}/admin/sync-tokens`,
        GET: (id) => `${API_BASE}/admin/sync-tokens/${id}`,
        ROTATE: (id) => `${API_BASE}/admin/sync-tokens/${id}/rotate`,
        REVOKE: (id) => `${API_BASE}/admin/sync-tokens/${id}`,
        STATS: (id) => `${API_BASE}/admin/sync-tokens/${id}/stats`,
        DELETE: (id) => `${API_BASE}/admin/sync-tokens/${id}/permanent`,
        CLEANUP: `${API_BASE}/admin/sync-tokens/cleanup`,
    },
    AUDIT_LOGS: {
        LIST: `${API_BASE}/admin/audit-logs`,
        ROTATE: (days) => `${API_BASE}/admin/audit-logs/rotate?days=${days}`,
    },
};

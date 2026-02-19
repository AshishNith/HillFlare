import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'http://10.59.84.198:5000'; // Your machine's LAN IP — change if network changes
const API_URL = `${BASE_URL}/api`;

interface ApiOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

async function getToken() {
    return await SecureStore.getItemAsync('accessToken');
}

async function refreshTokens(): Promise<boolean> {
    try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return false;
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        await SecureStore.setItemAsync('accessToken', data.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);
        return true;
    } catch {
        return false;
    }
}

async function request(path: string, options: ApiOptions = {}) {
    const token = await getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_URL}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Auto-refresh on 401
    if (res.status === 401) {
        const refreshed = await refreshTokens();
        if (refreshed) {
            const newToken = await getToken();
            if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(`${API_URL}${path}`, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
        }
    }

    const data = await res.json();
    if (!res.ok) throw { response: { status: res.status, data } };
    return { data, status: res.status };
}

const api = {
    get: (path: string, config?: { params?: Record<string, string> }) => {
        if (config?.params) {
            const qs = new URLSearchParams(config.params).toString();
            if (qs) return request(`${path}?${qs}`);
        }
        return request(path);
    },
    post: (path: string, body?: any) => request(path, { method: 'POST', body }),
    put: (path: string, body?: any) => request(path, { method: 'PUT', body }),
    delete: (path: string) => request(path, { method: 'DELETE' }),
};

export default api;

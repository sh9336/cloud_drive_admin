'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const AuthContext = createContext({
    user: null,
    login: async () => { },
    logout: async () => { },
    isAuthenticated: false,
    isLoading: true,
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check initial auth state from local storage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await authService.login(email, password);

            const { access_token, refresh_token, user: userData } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            router.push('/tenants'); // Default redirect
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        await authService.logout(refreshToken);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

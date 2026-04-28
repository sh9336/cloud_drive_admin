'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
};

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
        // Check initial auth state from non-HttpOnly user cookie
        const userCookie = getCookie('user');

        if (userCookie) {
            try {
                setUser(JSON.parse(userCookie));
            } catch (e) {
                console.error('Failed to parse user cookie');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            // This calls our Next.js API route (/api/auth/login), 
            // which handles contacting the real backend and setting HttpOnly cookies.
            const response = await authService.login(email, password);

            // Our BFF route returns `{ success: true, user: {...} }`
            const userData = response.user || response.data?.user;
            
            setUser(userData);
            router.push('/tenants');
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        // This calls our Next.js API route (/api/auth/logout)
        // which clears the HttpOnly cookies and informs the backend.
        await authService.logout();
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

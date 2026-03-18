'use client';

import { useAuth } from '@/store/authContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            redirect('/login');
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
                <div className="text-center space-y-4">
                    <LoadingSpinner className="w-8 h-8 text-indigo-600 mx-auto" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 transition-colors duration-300">
            <Sidebar />
            <div className="md:ml-64 min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            <div className="animate-in fade-in duration-300">
                                {children}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

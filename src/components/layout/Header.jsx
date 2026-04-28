'use client';

import { useAuth } from '@/store/authContext';
import { Button } from '@/components/ui/Button';
import { LogOut, Menu, ShieldCheck, LayoutDashboard, Users, Key } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/Sheet';
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/ui/Modal').then(mod => mod.Modal), { ssr: false });
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
    };

    const mobileNavItems = [
        {
            title: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Tenants',
            href: '/tenants',
            icon: Users,
        },
        {
            title: 'Sync Tokens',
            href: '/sync-tokens',
            icon: Key,
        },
    ];

    return (
        <>
            <header className="h-14 border-b border-zinc-200/50 bg-white/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                {/* Mobile Menu */}
                <div className="md:hidden flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0 flex flex-col bg-white dark:bg-zinc-950">
                            <div className="h-14 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
                                <SheetTitle className="flex items-center gap-2 font-bold text-base text-zinc-900 dark:text-zinc-100">
                                    <ShieldCheck className="w-5 h-5" />
                                    CloudAdmin
                                </SheetTitle>
                                <SheetDescription className="hidden">Navigation Menu</SheetDescription>
                            </div>
                            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                                {mobileNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                            pathname.startsWith(item.href)
                                                ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Admin</span>
                </div>

                {/* Desktop Spacer */}
                <div className="hidden md:block flex-1" />

                {/* User Actions */}
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 h-8 px-3 text-xs font-medium"
                    >
                        <LogOut className="w-4 h-4 mr-1.5" />
                        Logout
                    </Button>
                    <Link href="/profile">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500/30 dark:ring-indigo-500/20">
                            {user?.full_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                    </Link>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Confirm Logout"
                description="Are you sure you want to leave? You'll need to log in again to access the admin panel."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmLogout}>
                            Logout
                        </Button>
                    </>
                }
            />
        </>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Key,
    ShieldCheck
} from 'lucide-react';

const sidebarItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Dashboard analytics'
    },
    {
        title: 'Tenants',
        href: '/tenants',
        icon: Users,
        description: 'Manage tenants'
    },
    {
        title: 'Sync Tokens',
        href: '/sync-tokens',
        icon: Key,
        description: 'Access tokens'
    },
    {
        title: 'Audit Logs',
        href: '/audit-logs',
        icon: ShieldCheck,
        description: 'Activity logs'
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50 hidden md:flex flex-col z-50 backdrop-blur-xl">
            {/* Logo Section */}
            <div className="h-14 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2.5 font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span>CloudAdmin</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"
                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/30"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4 transition-transform",
                                isActive && "scale-110"
                            )} />
                            <div className="flex flex-col gap-0.5 flex-1">
                                <span>{item.title}</span>
                                <span className={cn(
                                    "text-[11px] font-normal opacity-0 transition-opacity duration-200",
                                    isActive && "opacity-75"
                                )}>
                                    {item.description}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

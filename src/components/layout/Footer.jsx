'use client';

import Link from 'next/link';
import { Mail, HelpCircle, Scale } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-zinc-200/50 bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* Brand Info */}
                    <div className="space-y-3">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cloud Drive Admin</div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Enterprise-grade admin panel for managing cloud storage infrastructure, tenants, and access tokens.
                        </p>
                    </div>

                    

                    {/* Status */}
                    <div className="space-y-3">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">System Status</div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-zinc-600 dark:text-zinc-400">All systems operational</span>
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-500">
                                Version 1.0.0
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-6">
                    {/* Bottom */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            &copy; {currentYear} Cloud Drive. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#terms" className="text-xs font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                                Terms of Service
                            </a>
                            <a href="#privacy" className="text-xs font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#cookies" className="text-xs font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

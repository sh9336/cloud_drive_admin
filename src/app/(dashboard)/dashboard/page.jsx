'use client';

import { useEffect, useState } from 'react';
import { tenantService } from '@/services/tenantService';
import { syncTokenService } from '@/services/syncTokenService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Key, HardDrive, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        totalTokens: 0,
        activeTokens: 0,
        totalUploaded: 0,
        totalDownloaded: 0,
        totalRequests: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [tenantsRes, tokensRes] = await Promise.all([
                    tenantService.list(),
                    syncTokenService.list()
                ]);

                const tenants = tenantsRes.data || [];
                const tokens = tokensRes.data || [];

                const totalUploaded = tokens.reduce((acc, t) => acc + (t.total_bytes_uploaded || 0), 0);
                const totalDownloaded = tokens.reduce((acc, t) => acc + (t.total_bytes_downloaded || 0), 0);
                const totalRequests = tokens.reduce((acc, t) => acc + (t.total_requests || 0), 0);

                setStats({
                    totalTenants: tenants.length,
                    activeTenants: tenants.filter(t => t.is_active).length,
                    totalTokens: tokens.length,
                    activeTokens: tokens.filter(t => t.is_active).length,
                    totalUploaded,
                    totalDownloaded,
                    totalRequests
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return <div className="h-96 flex items-center justify-center"><LoadingSpinner className="w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-zinc-500">System-wide statistics and activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                        <Users className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTenants}</div>
                        <p className="text-xs text-zinc-500">
                            {stats.activeTenants} active accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sync Tokens</CardTitle>
                        <Key className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTokens}</div>
                        <p className="text-xs text-zinc-500">
                            out of {stats.totalTokens} total tokens
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Stored</CardTitle>
                        <HardDrive className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats.totalUploaded)}</div>
                        <div className="flex items-center text-xs text-zinc-500 mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                            Uploaded
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
                        <Activity className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats.totalDownloaded)}</div>
                        <div className="flex items-center text-xs text-zinc-500 mt-1">
                            <ArrowDownRight className="mr-1 h-3 w-3 text-blue-500" />
                            Downloaded
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* We could add generic "Recent Activity" here if we had an audit log, 
          but for now maybe just a note or empty state */}
            <Card className="bg-zinc-50 dark:bg-zinc-900 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
                    <Activity className="h-10 w-10 mb-4 opacity-50" />
                    <p className="text-sm font-medium">System activity logs coming soon</p>
                    <p className="text-xs">Real-time event tracking will be available in the next update.</p>
                </CardContent>
            </Card>
        </div>
    );
}

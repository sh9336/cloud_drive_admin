'use client';

import { useEffect, useState, use } from 'react';
import { syncTokenService } from '@/services/syncTokenService';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Activity, HardDrive, Hash, Calendar } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export default function TokenStatsPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [id]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await syncTokenService.getStats(id);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return <div className="h-96 flex items-center justify-center"><LoadingSpinner className="w-8 h-8" /></div>;
    }

    if (!stats) {
        return <div>Token not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/sync-tokens">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Token Statistics</h1>
                    <p className="text-zinc-500">{stats.token_name}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Hash className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_requests}</div>
                        <p className="text-xs text-zinc-500">
                            Lifetime API hits
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Until Expiry</CardTitle>
                        <Calendar className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.days_until_expiry}</div>
                        <p className="text-xs text-zinc-500">
                            Expires {formatDate(stats.expires_at)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
                        <HardDrive className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats.total_bytes_uploaded)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Downloaded</CardTitle>
                        <HardDrive className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatBytes(stats.total_bytes_downloaded)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Token Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-zinc-500">Token ID</div>
                            <div className="font-mono">{stats.token_id}</div>
                        </div>
                        <div>
                            <div className="font-medium text-zinc-500">Created At</div>
                            <div>{formatDate(stats.created_at)}</div>
                        </div>
                        <div>
                            <div className="font-medium text-zinc-500">Last Used</div>
                            <div>{stats.last_used_at ? formatDate(stats.last_used_at) : 'Never'}</div>
                        </div>
                        <div>
                            <div className="font-medium text-zinc-500">Status</div>
                            <div>
                                <Badge variant={stats.is_active ? 'success' : 'destructive'}>
                                    {stats.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

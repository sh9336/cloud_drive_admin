'use client';

import { useEffect, useState } from 'react';
import { syncTokenService } from '@/services/syncTokenService';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/ui/Modal').then(mod => mod.Modal), { ssr: false });
import { Plus, Check, X, Ban, Activity, Trash2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatBytes } from '@/lib/utils';

export default function SyncTokensPage() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cleaning, setCleaning] = useState(false);
    const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tokenToDelete, setTokenToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchTokens();
    }, []);

    const fetchTokens = async () => {
        try {
            setLoading(true);
            const response = await syncTokenService.list();
            setTokens(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load sync tokens');
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        try {
            setCleaning(true);
            await syncTokenService.cleanupRevoked();
            setIsCleanupModalOpen(false);
            await fetchTokens();
        } catch (err) {
            console.error(err);
            alert('Failed to cleanup tokens');
        } finally {
            setCleaning(false);
        }
    };

    const handleDelete = async () => {
        if (!tokenToDelete) return;

        try {
            setDeleting(true);
            await syncTokenService.deletePermanent(tokenToDelete.id);
            setIsDeleteModalOpen(false);
            setTokenToDelete(null);
            await fetchTokens();
        } catch (err) {
            console.error(err);
            alert('Failed to delete token');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                        <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                        <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    </div>
                </div>

                <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardContent className="p-0">
                        <div className="p-4 space-y-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                                    <div className="space-y-2">
                                        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                        <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                    </div>
                                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                    <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                    <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sync Tokens</h1>
                    <p className="text-zinc-500 text-sm">Monitor and manage access tokens across all tenants.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCleanupModalOpen(true)}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-950/20"
                    >
                        <Ban className="w-4 h-4 mr-2" />
                        Cleanup Revoked
                    </Button>
                    <Button variant="default" size="sm" onClick={fetchTokens}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Modal
                isOpen={isCleanupModalOpen}
                onClose={() => setIsCleanupModalOpen(false)}
                title="Cleanup Revoked Tokens"
                description="Maintenance: This will permanently delete all revoked sync tokens."
                footer={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setIsCleanupModalOpen(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
                            onClick={handleCleanup}
                            disabled={cleaning}
                        >
                            {cleaning ? <LoadingSpinner className="w-3.5 h-3.5 mr-2" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
                            Execute Cleanup
                        </Button>
                    </>
                }
            >
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30 space-y-3">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-tight">
                        <ShieldAlert className="w-4 h-4" />
                        Destructive Action
                    </div>
                    <p className="text-xs leading-relaxed text-red-600 dark:text-red-300 opacity-90 font-medium">
                        This action is irreversible. All sync tokens currently marked as <strong>Revoked</strong> or <strong>Inactive</strong> across all tenants will be permanently removed from the database.
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Sync Token"
                description={`Are you sure you want to permanently delete token "${tokenToDelete?.name}"?`}
                footer={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? <LoadingSpinner className="w-3.5 h-3.5 mr-2" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
                            Delete Permanently
                        </Button>
                    </>
                }
            >
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 space-y-3">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-tight">
                        <ShieldAlert className="w-4 h-4" />
                        Warning
                    </div>
                    <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300 opacity-90 font-medium">
                        This action will permanently remove this sync token. Any devices currently using this token will lose access immediately.
                    </p>
                </div>
            </Modal>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30">
                                <TableHead className="w-[200px] font-bold text-xs">Token Name</TableHead>
                                <TableHead className="w-[200px] font-bold text-xs">Tenant</TableHead>
                                <TableHead className="w-[120px] font-bold text-xs">Permissions</TableHead>
                                <TableHead className="w-[150px] font-bold text-xs">Usage (Up/Down)</TableHead>
                                <TableHead className="w-[180px] font-bold text-xs">Expires</TableHead>
                                <TableHead className="w-[100px] font-bold text-xs">Status</TableHead>
                                <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tokens.map((token) => (
                                <TableRow key={token.id}>
                                    <TableCell>
                                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{token.name}</div>
                                        <div className="text-[10px] text-zinc-400 font-mono break-all mt-1">
                                            {token.id}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{token.company_name || token.tenant_name}</span>
                                            <span className="text-xs text-zinc-500">{token.tenant_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${token.can_read ? 'border-green-200 bg-green-50 text-green-700' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}`}>
                                                R
                                            </span>
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${token.can_write ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}`}>
                                                W
                                            </span>
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${token.can_delete ? 'border-red-200 bg-red-50 text-red-700' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}`}>
                                                D
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-1">
                                            <div className="text-zinc-500">↑ {formatBytes(token.total_bytes_uploaded)}</div>
                                            <div className="text-zinc-500">↓ {formatBytes(token.total_bytes_downloaded)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-zinc-600">{formatDate(token.expires_at)}</span>
                                    </TableCell>
                                    <TableCell>
                                        {token.is_active ? (
                                            <Badge variant="success">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Revoked</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/sync-tokens/${token.id}/stats`}>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    <Activity className="w-4 h-4 mr-2" />
                                                    Stats
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                                                onClick={() => {
                                                    setTokenToDelete(token);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tokens.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                        No sync tokens found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

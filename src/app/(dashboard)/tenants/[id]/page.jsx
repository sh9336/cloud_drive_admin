'use client';

import { useEffect, useState, use } from 'react';
import { tenantService } from '@/services/tenantService';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ArrowLeft, RefreshCw, Power, RotateCcw, Trash2, ShieldAlert, Activity, Plus } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { syncTokenService } from '@/services/syncTokenService';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function TenantDetailsPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [tenant, setTenant] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    // Modal States
    const [modalState, setModalState] = useState({
        type: null, // 'disable' | 'resetRequest' | 'resetResult' | 'revoke' | 'createToken' | 'rotateToken' | 'tokenResult' | 'deleteToken' | 'finalDelete'
        isOpen: false,
        data: null // store temporary data
    });
    const [disableReason, setDisableReason] = useState("Manual deactivation by admin");

    // Token Form States
    const [tokenForm, setTokenForm] = useState({
        name: '',
        expires_in_days: 90,
        can_read: true,
        can_write: false,
        can_delete: false
    });

    // Rotate Form States
    const [rotateForm, setRotateForm] = useState({
        expires_in_days: 90,
        grace_period_days: 7
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch tenant data - required
            const tenantRes = await tenantService.get(id);
            setTenant(tenantRes.data);
            
            // Fetch sync tokens - optional, don't block if it fails
            try {
                const tokensRes = await tenantService.getSyncTokens(id);
                setTokens(tokensRes.data || []);
            } catch (tokenErr) {
                console.error('Failed to fetch sync tokens:', tokenErr);
                console.error('Error details:', {
                    status: tokenErr.response?.status,
                    statusText: tokenErr.response?.statusText,
                    data: tokenErr.response?.data,
                    url: tokenErr.config?.url
                });
                setTokens([]);
                // Show warning but don't block tenant details from loading
                toast({
                    variant: "destructive",
                    title: "Sync tokens unavailable",
                    description: "Could not load sync tokens for this tenant. The backend endpoint may be experiencing issues."
                });
            }
        } catch (err) {
            console.error('Failed to fetch tenant details:', err);
            toast({
                variant: "destructive",
                title: "Error fetching details",
                description: "Failed to load tenant details. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalState({ type: null, isOpen: false, data: null });
        setDisableReason("Manual deactivation by admin");
        setTokenForm({
            name: '',
            expires_in_days: 90,
            can_read: true,
            can_write: false,
            can_delete: false
        });
        setRotateForm({
            expires_in_days: 90,
            grace_period_days: 7
        });
    };

    // --- Actions ---

    const initiateStatusToggle = async () => {
        if (!tenant) return;

        // If currently active, we are disabling, so open modal
        if (tenant.is_active) {
            setModalState({ type: 'disable', isOpen: true, data: null });
            return;
        }

        // If inactive, just activate
        try {
            setActionLoading(true);
            await tenantService.updateStatus(id, true, null);
            await fetchData();
            toast({
                variant: "success",
                title: "Account Activated",
                description: "The tenant account has been successfully activated."
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Activation Failed",
                description: err.response?.data?.error || "Could not activate account."
            });
        } finally {
            setActionLoading(false);
        }
    };

    const confirmDisable = async () => {
        try {
            setActionLoading(true);
            await tenantService.updateStatus(id, false, disableReason);
            await fetchData();
            closeModal();
            toast({
                title: "Account Disabled",
                description: "The tenant account has been disabled."
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Disable Failed",
                description: "Could not disable account."
            });
        } finally {
            setActionLoading(false);
        }
    };

    const initiateResetPassword = () => {
        setModalState({ type: 'resetRequest', isOpen: true, data: null });
    };

    const confirmResetPassword = async () => {
        try {
            setActionLoading(true);
            const res = await tenantService.resetPassword(id);
            // Show result
            setModalState({ type: 'resetResult', isOpen: true, data: res.data.temporary_password });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const initiateRevokeToken = (tokenId) => {
        setModalState({ type: 'revoke', isOpen: true, data: tokenId });
    };

    const confirmRevokeToken = async () => {
        const tokenId = modalState.data;
        if (!tokenId) return;

        try {
            setActionLoading(true);
            await syncTokenService.revoke(tokenId, "Revoked by admin via dashboard");
            await fetchData();
            closeModal();
            toast({
                variant: "success",
                title: "Token Revoked",
                description: "Access has been revoked for this token."
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Revoke Failed",
                description: "Could not revoke token."
            });
        } finally {
            setActionLoading(false);
        }
    };

    const initiateCreateToken = () => {
        setModalState({ type: 'createToken', isOpen: true, data: null });
    };

    const confirmCreateToken = async () => {
        try {
            setActionLoading(true);
            const res = await syncTokenService.create({
                tenant_id: id,
                ...tokenForm
            });
            // Show result with the raw token
            setModalState({ type: 'tokenResult', isOpen: true, data: res.data });
            await fetchData();
            toast({
                variant: "success",
                title: "Token Created",
                description: "New sync token has been generated."
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: "Could not create new token."
            });
        } finally {
            setActionLoading(false);
        }
    };

    const initiateRotateToken = (token) => {
        setModalState({ type: 'rotateToken', isOpen: true, data: token });
    };

    const confirmRotateToken = async () => {
        const token = modalState.data;
        if (!token) return;

        try {
            setActionLoading(true);
            const res = await syncTokenService.rotate(token.id, rotateForm.expires_in_days, rotateForm.grace_period_days);
            // Show result with the new raw token
            setModalState({ type: 'tokenResult', isOpen: true, data: { sync_token: res.data.new_token } });
            await fetchData();
            toast({
                variant: "success",
                title: "Token Rotated",
                description: "Token has been rotated successfully."
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Rotation Failed",
                description: "Could not rotate token."
            });
        } finally {
            setActionLoading(false);
        }
    };

    const initiateDeleteToken = (token) => {
        setModalState({ type: 'deleteToken', isOpen: true, data: token });
    };

    const confirmDeleteToken = async () => {
        const token = modalState.data;
        if (!token) return;

        try {
            setActionLoading(true);
            await syncTokenService.deletePermanent(token.id);
            await fetchData();
            closeModal();
            toast({
                variant: "success",
                title: "Token Deleted",
                description: "Sync token has been permanently removed."
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete sync token."
            });
        } finally {
            setActionLoading(false);
        }
    };

    const initiateDeleteTenant = () => {
        setModalState({ type: 'finalDelete', isOpen: true, data: null });
    };

    const confirmDeleteTenant = async () => {
        try {
            setActionLoading(true);
            await tenantService.delete(id);
            toast({
                variant: "success",
                title: "Tenant Destroyed",
                description: "The tenant and all associated data have been permanently removed."
            });
            router.push('/tenants');
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete tenant profile."
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center">
                <LoadingSpinner className="w-8 h-8 mb-4" />
                <p className="text-sm text-zinc-500">Loading tenant details...</p>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center space-y-4">
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Tenant not found</p>
                <Link href="/tenants">
                    <Button variant="outline">Back to Tenants</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                    <Link href="/tenants">
                        <Button variant="ghost" size="icon" className="mt-1">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                {tenant.company_name}
                            </h1>
                            <Badge 
                                variant={tenant.is_active ? 'success' : 'secondary'}
                                className="text-xs"
                            >
                                {tenant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {tenant.full_name} • {tenant.email}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap justify-end">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={initiateResetPassword} 
                        disabled={actionLoading}
                        className="text-xs"
                    >
                        <RefreshCw className="w-4 h-4 mr-1.5" />
                        Reset Password
                    </Button>
                    <Button
                        size="sm"
                        variant={tenant.is_active ? "destructive" : "default"}
                        onClick={initiateStatusToggle}
                        disabled={actionLoading}
                        className="text-xs"
                    >
                        <Power className="w-4 h-4 mr-1.5" />
                        {tenant.is_active ? 'Disable' : 'Activate'}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                        onClick={initiateDeleteTenant}
                        disabled={actionLoading}
                    >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge 
                            variant={tenant.is_active ? 'success' : 'secondary'}
                            className="text-base px-3 py-1.5"
                        >
                            {tenant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-3">
                            {tenant.disabled_reason && `Reason: ${tenant.disabled_reason}`}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Member Since</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatDate(tenant.created_at)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Tokens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {tokens.filter(t => t.is_active).length}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-3">
                            {tokens.length} total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sync Tokens Section */}
            <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <div>
                        <CardTitle className="text-lg">Sync Tokens</CardTitle>
                        <CardDescription className="text-xs mt-1">Manage API access tokens for this tenant</CardDescription>
                    </div>
                    <Button 
                        onClick={initiateCreateToken} 
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Token
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-zinc-200/50 dark:border-zinc-800/50">
                                    <TableHead className="text-xs font-semibold">Token Name</TableHead>
                                    <TableHead className="text-xs font-semibold">Permissions</TableHead>
                                    <TableHead className="text-xs font-semibold">Usage</TableHead>
                                    <TableHead className="text-xs font-semibold">Expires</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-20 text-center text-zinc-500 text-sm">
                                            No sync tokens. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tokens.map((token) => (
                                        <TableRow key={token.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                                        {token.name || 'Unnamed Token'}
                                                    </div>
                                                    <div className="text-xs text-zinc-400 font-mono truncate max-w-xs">
                                                        {token.id}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                        token.can_read 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                                                    }`}>
                                                        R
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                        token.can_write
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                                                    }`}>
                                                        W
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                        token.can_delete
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                                                    }`}>
                                                        D
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-0.5">
                                                    <div className="text-zinc-600 dark:text-zinc-400">↑ {formatBytes(token.total_bytes_uploaded)}</div>
                                                    <div className="text-zinc-600 dark:text-zinc-400">↓ {formatBytes(token.total_bytes_downloaded)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    {formatDate(token.expires_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={token.is_active ? 'success' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {token.is_active ? 'Active' : 'Revoked'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    {token.is_active && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-xs"
                                                                onClick={() => initiateRotateToken(token)}
                                                                disabled={actionLoading}
                                                            >
                                                                <RotateCcw className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                onClick={() => initiateRevokeToken(token.id)}
                                                                disabled={actionLoading}
                                                            >
                                                                <ShieldAlert className="w-3 h-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => initiateDeleteToken(token)}
                                                        disabled={actionLoading}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Tenant Info Card */}
            <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tenant ID</p>
                            <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300 break-all">{tenant.id}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">S3 Prefix</p>
                            <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300 break-all">{tenant.s3_prefix}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}

            {/* Disable Account Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'disable'}
                onClose={closeModal}
                title="Disable Tenant Account"
                description="Are you sure you want to disable this account? This will revoke all access immediately."
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDisable} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Disable Account
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason for deactivation</label>
                        <Input
                            value={disableReason}
                            onChange={(e) => setDisableReason(e.target.value)}
                            placeholder="e.g. Violation of terms"
                        />
                    </div>
                </div>
            </Modal>

            {/* Revoke Token Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'revoke'}
                onClose={closeModal}
                title="Revoke Sync Token"
                description="Are you sure you want to revoke this token? Any applications using it will lose access immediately. This cannot be undone."
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmRevokeToken} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Revoke Token
                        </Button>
                    </>
                }
            />

            {/* Permanent Delete Token Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'deleteToken'}
                onClose={closeModal}
                title="Delete Sync Token Permanently"
                description={`Are you sure you want to permanently delete token "${modalState.data?.name}"?`}
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteToken} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Delete Permanently
                        </Button>
                    </>
                }
            >
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 space-y-3">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-tight">
                        <ShieldAlert className="w-4 h-4" />
                        Security Warning
                    </div>
                    <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300 opacity-90 font-medium">
                        This action will permanently remove this sync token. Any devices currently using this token will lose access immediately. This action cannot be undone.
                    </p>
                </div>
            </Modal>

            {/* Final Tenant Delete Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'finalDelete'}
                onClose={closeModal}
                title="Destroy Tenant Account"
                description={`This is a permanent action. You are about to destroy the account for "${tenant.company_name}".`}
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteTenant} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            I understand, Delete Tenant
                        </Button>
                    </>
                }
            >
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-tight">
                        <ShieldAlert className="w-5 h-5" />
                        Irreversible Destruction
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-300 space-y-2 opacity-90 font-medium">
                        <p>Executing this deletion will result in:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Permanent removal of all database entries.</li>
                            <li>Instant revocation of every sync token.</li>
                            <li>Immediate logout of the tenant from all devices.</li>
                            <li>Deletion of all S3 objects associated with this tenant.</li>
                        </ul>
                    </div>
                </div>
            </Modal>

            {/* Reset Password Request Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'resetRequest'}
                onClose={closeModal}
                title="Reset Tenant Password"
                description="This will generate a NEW temporary password and revoke all existing sessions for this tenant. Are you sure?"
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button onClick={confirmResetPassword} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Confirm Reset
                        </Button>
                    </>
                }
            />

            {/* Reset Password Result Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'resetResult'}
                onClose={closeModal}
                title="Password Reset Successful"
                description="Please copy the new temporary password below. It will not be shown again."
                footer={
                    <Button onClick={closeModal}>Done</Button>
                }
            >
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md text-center font-mono text-lg tracking-wider select-all border border-zinc-200 dark:border-zinc-700">
                    {modalState.data}
                </div>
            </Modal>

            {/* Create Token Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'createToken'}
                onClose={closeModal}
                title="Create Sync Token"
                description="Generate a new access token for this tenant."
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button onClick={confirmCreateToken} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Create Token
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Token Name</label>
                        <Input
                            value={tokenForm.name}
                            onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })}
                            placeholder="e.g. Mobile App Production"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio (Expires In Days)</label>
                        <Input
                            type="number"
                            value={tokenForm.expires_in_days}
                            onChange={(e) => setTokenForm({ ...tokenForm, expires_in_days: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Permissions</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={tokenForm.can_read} onChange={(e) => setTokenForm({ ...tokenForm, can_read: e.target.checked })} />
                                Read
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={tokenForm.can_write} onChange={(e) => setTokenForm({ ...tokenForm, can_write: e.target.checked })} />
                                Write
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={tokenForm.can_delete} onChange={(e) => setTokenForm({ ...tokenForm, can_delete: e.target.checked })} />
                                Delete
                            </label>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Rotate Token Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'rotateToken'}
                onClose={closeModal}
                title="Rotate Sync Token"
                description={`Rotate token "${modalState.data?.name}". This will create a new token and expire the old one after a grace period.`}
                footer={
                    <>
                        <Button variant="ghost" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                        <Button onClick={confirmRotateToken} disabled={actionLoading}>
                            {actionLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Rotate Token
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Expiry (Days)</label>
                        <Input
                            type="number"
                            value={rotateForm.expires_in_days}
                            onChange={(e) => setRotateForm({ ...rotateForm, expires_in_days: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Grace Period (Days)</label>
                        <div className="text-xs text-zinc-500 mb-1">How long the old token remains valid.</div>
                        <Input
                            type="number"
                            value={rotateForm.grace_period_days}
                            onChange={(e) => setRotateForm({ ...rotateForm, grace_period_days: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Token Result Modal */}
            <Modal
                isOpen={modalState.isOpen && modalState.type === 'tokenResult'}
                onClose={closeModal}
                title="Token Generated Successfully"
                description="Please copy the token below. It will not be shown again."
                footer={
                    <Button onClick={closeModal}>Done</Button>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md break-all font-mono text-sm border border-zinc-200 dark:border-zinc-700 select-all text-zinc-900 dark:text-zinc-100">
                        {modalState.data?.sync_token || modalState.data?.token || modalState.data?.new_token}
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                        Warning: This token grants access to the tenant's data. Share it securely.
                    </p>
                </div>
            </Modal>

        </div >
    );
}

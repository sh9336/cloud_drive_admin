'use client';

import { useEffect, useState } from 'react';
import { tenantService } from '@/services/tenantService';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Trash2, ShieldAlert, CheckCircle2, Copy, Check, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/store/authContext';
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/ui/Modal').then(mod => mod.Modal), { ssr: false });
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { toast } = useToast();
    
    // Creation Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState('form'); // 'form' or 'success'
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [creationResult, setCreationResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        company_name: ''
    });
    
    // Delete Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const response = await tenantService.list();
            setTenants(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load tenants');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateStep('form');
        setFormData({ email: '', full_name: '', company_name: '' });
        setCreateError(null);
        setCreationResult(null);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateStep('form');
        setFormData({ email: '', full_name: '', company_name: '' });
        setCreateError(null);
        setCreationResult(null);
        setCopied(false);
    };

    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);

        try {
            const response = await tenantService.create(formData);
            setCreationResult(response.data);
            setCreateStep('success');
            await fetchTenants();
            toast({
                variant: "success",
                title: "Tenant Created",
                description: "Tenant account has been created successfully."
            });
        } catch (err) {
            console.error(err);
            setCreateError(err.response?.data?.error || 'Failed to create tenant');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCopyPassword = () => {
        if (!creationResult?.temporary_password) return;
        navigator.clipboard.writeText(creationResult.temporary_password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeleteTenant = async () => {
        if (!tenantToDelete) return;

        try {
            setIsDeleting(true);
            await tenantService.delete(tenantToDelete.id);
            setTenants(tenants.filter(t => t.id !== tenantToDelete.id));
            setIsDeleteModalOpen(false);
            setTenantToDelete(null);
            toast({
                variant: "success",
                title: "Tenant Deleted",
                description: `Tenant "${tenantToDelete.company_name}" has been permanently removed.`
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: err.response?.data?.error || "Could not delete tenant."
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Tenants</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage and monitor all tenant accounts</p>
                </div>
                <Button 
                    size="sm"
                    onClick={handleOpenCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tenant
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company / Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <LoadingSpinner className="w-5 h-5 mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : tenants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        No tenants found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tenants.map((tenant) => (
                                    <TableRow key={tenant.id} className="group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{tenant.company_name}</span>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{tenant.full_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{tenant.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={tenant.is_active ? 'success' : 'secondary'}>
                                                {tenant.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(tenant.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/tenants/${tenant.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 text-xs text-zinc-600 border-zinc-200/50 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:border-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                                                        Details
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => {
                                                        setTenantToDelete(tenant);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Tenant Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        {createStep === 'form' ? (
                            <>
                                <CardHeader className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Create New Tenant</CardTitle>
                                            <CardDescription>Add a new tenant account to the system</CardDescription>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={handleCloseCreateModal}
                                            className="h-8 w-8"
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                </CardHeader>
                                <form onSubmit={handleSubmitCreate}>
                                    <CardContent className="space-y-4 py-6">
                                        {createError && (
                                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                                <AlertCircle size={16} className="flex-shrink-0" />
                                                {createError}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Company Name *</label>
                                            <Input
                                                required
                                                placeholder="e.g., Acme Corp"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Full Name *</label>
                                            <Input
                                                required
                                                placeholder="e.g., John Doe"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Email Address *</label>
                                            <Input
                                                required
                                                type="email"
                                                placeholder="e.g., john@acmecorp.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="h-10"
                                            />
                                        </div>
                                    </CardContent>
                                    <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-end gap-3">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={handleCloseCreateModal}
                                            disabled={createLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit"
                                            disabled={createLoading}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {createLoading ? (
                                                <>
                                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Tenant'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <CardHeader className="text-center space-y-4 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mx-auto">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Tenant Created Successfully!</CardTitle>
                                        <CardDescription className="mt-2">
                                            Account for <strong>{creationResult?.tenant?.company_name}</strong> is ready
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6 py-6">
                                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-lg text-sm text-blue-900 dark:text-blue-300 flex items-start gap-3">
                                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                        <p>Share these credentials with the tenant. They'll need to change the password on first login.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">Login Email</label>
                                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium text-zinc-900 dark:text-zinc-100">
                                                {creationResult?.tenant?.email}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">Temporary Password</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 p-4 bg-zinc-950 text-white rounded-lg font-mono text-lg tracking-wider border border-zinc-800 shadow-inner">
                                                    {creationResult?.temporary_password}
                                                </div>
                                                <Button
                                                    size="lg"
                                                    variant={copied ? "success" : "default"}
                                                    className="h-[50px] px-4"
                                                    onClick={handleCopyPassword}
                                                >
                                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-bold uppercase text-zinc-500">Tenant ID</div>
                                            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate">{creationResult?.tenant?.id}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-bold uppercase text-zinc-500">S3 Prefix</div>
                                            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate">{creationResult?.tenant?.s3_prefix}</div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 p-4 flex gap-3">
                                    <Button 
                                        variant="outline"
                                        onClick={handleCloseCreateModal}
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                    <Link href={`/tenants/${creationResult?.tenant?.id}`} className="flex-1">
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                            <ExternalLink size={16} className="mr-2" />
                                            View Full Details
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            )}

            {/* Delete Tenant Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title="Delete Tenant Permanently"
                description={`Warning: This will permanently destroy all data associated with "${tenantToDelete?.company_name}".`}
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteTenant}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Permanently Delete
                        </Button>
                    </>
                }
            >
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-tight">
                        <ShieldAlert className="w-4 h-4" />
                        Critical Action
                    </div>
                    <ul className="text-xs text-red-600 dark:text-red-300 space-y-1 opacity-90 font-medium">
                        <li>• All sync tokens will be instantly revoked.</li>
                        <li>• All files and folders will be permanently deleted.</li>
                        <li>• The tenant will be logged out of all active sessions.</li>
                        <li>• This action is <strong>irreversible</strong>.</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tenantService } from '@/services/tenantService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, AlertCircle, CheckCircle2, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function CreateTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        company_name: ''
    });
    const [creationResult, setCreationResult] = useState(null);
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await tenantService.create(formData);
            setCreationResult(response.data);
            toast({
                variant: "success",
                title: "Tenant Created",
                description: "Tenant account has been created successfully."
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create tenant');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = () => {
        if (!creationResult?.temporary_password) return;
        navigator.clipboard.writeText(creationResult.temporary_password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Copied!",
            description: "Temporary password copied to clipboard."
        });
    };

    if (creationResult) {
        const { tenant, temporary_password } = creationResult;
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenant Created Ready!</h1>
                    <p className="text-zinc-500 max-w-md mx-auto">
                        The account for <strong>{tenant.company_name}</strong> has been created. Use the credentials below to provide access to the client.
                    </p>
                </div>

                <Card className="border-green-200 dark:border-green-900/30 shadow-lg shadow-green-500/5">
                    <CardHeader className="bg-green-50/50 dark:bg-green-950/10 border-b border-green-100 dark:border-green-900/20">
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                            <ShieldCheck size={20} />
                            Administrative Credentials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <div className="grid gap-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Login Email</label>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-medium">
                                    {tenant.email}
                                </div>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Temporary Password</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-4 bg-zinc-950 text-white rounded-lg font-mono text-xl tracking-wider border border-zinc-800 shadow-inner group relative overflow-hidden">
                                        <div className="relative z-10">{temporary_password}</div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <Button
                                        size="lg"
                                        variant={copied ? "success" : "default"}
                                        className="h-[58px] px-6 transition-all"
                                        onClick={handleCopyPassword}
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1.5 mt-2">
                                    <AlertCircle size={14} />
                                    The tenant will be required to change this password on their first login.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                <div className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Tenant ID</div>
                                <div className="text-xs font-mono truncate text-zinc-600 dark:text-zinc-400">{tenant.id}</div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                <div className="text-[10px] font-bold uppercase text-zinc-400 mb-1">S3 Prefix</div>
                                <div className="text-xs font-mono truncate text-zinc-600 dark:text-zinc-400">{tenant.s3_prefix}</div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 p-6 mt-0">
                        <Link href="/tenants" className="w-full">
                            <Button variant="outline" className="w-full">
                                Back to Tenant List
                            </Button>
                        </Link>
                        <Link href={`/tenants/${tenant.id}`} className="w-full">
                            <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                <ExternalLink size={16} className="mr-2" />
                                View Full Details
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/tenants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Tenant</h1>
                    <p className="text-zinc-500">Add a new tenant to the system.</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Tenant Details</CardTitle>
                        <CardDescription>Enter the basic information for the new tenant.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 dark:bg-red-950/50 dark:text-red-400">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <Input
                                required
                                placeholder="Acme Corp"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                required
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                required
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 text-right">
                        <Link href="/tenants">
                            <Button type="button" variant="secondary">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                            Create Tenant
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { auditLogService } from '@/services/auditLogService';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/ui/Modal').then(mod => mod.Modal), { ssr: false });
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Activity,
    Shield,
    User,
    Clock,
    FilterX,
    Trash2,
    Mail,
    ChevronDown,
    ChevronUp,
    Info,
    Database
} from 'lucide-react';

export default function AuditLogsPage() {
    const { toast } = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total_pages: 1,
        total_count: 0
    });
    const [filters, setFilters] = useState({
        actor_type: '',
        actor_email: '',
        status: '',
        action: '',
        start_date: '',
        end_date: ''
    });
    const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
    const [rotateDays, setRotateDays] = useState(30);
    const [rotating, setRotating] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            };
            const response = await auditLogService.list(params);

            // Adjusting to documented response structure: response.data.logs and response.data.pagination
            const logData = response.data?.logs || [];
            const paginationData = response.data?.pagination || {};

            setLogs(logData);
            setPagination(prev => ({
                ...prev,
                total_pages: paginationData.total_pages || 1,
                total_count: paginationData.total_records || 0
            }));
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            if (err.response?.status === 429) {
                toast({
                    variant: "destructive",
                    title: "Rate Limit Exceeded",
                    description: "You are making too many requests. Please slow down and try again."
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error fetching logs",
                    description: err.response?.data?.error || "An unexpected error occurred."
                });
            }
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            actor_type: '',
            actor_email: '',
            status: '',
            action: '',
            start_date: '',
            end_date: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleRotate = async () => {
        try {
            setRotating(true);
            const response = await auditLogService.rotate(rotateDays);
            // Show some success feedback if needed, but for now just close and refresh
            setIsRotateModalOpen(false);
            fetchLogs();
        } catch (err) {
            console.error('Failed to rotate logs:', err);
        } finally {
            setRotating(false);
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return <Badge variant="success" className="capitalize">Success</Badge>;
            case 'failure':
                return <Badge variant="destructive" className="capitalize">Failure</Badge>;
            default:
                return <Badge variant="secondary" className="capitalize">{status || 'Unknown'}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Audit Logs
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        Tracks all administrative and system actions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchLogs()}
                        disabled={loading}
                        className="h-8 text-xs bg-white dark:bg-zinc-900 shadow-sm border-zinc-200/50 dark:border-zinc-800/50"
                    >
                        <RotateCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-950/20 bg-white dark:bg-zinc-900 shadow-sm"
                        onClick={() => setIsRotateModalOpen(true)}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Rotate Logs
                    </Button>
                </div>
            </div>

            <Card className="border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-end">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 ml-1">
                            <User className="w-3 h-3" /> Actor Type
                        </label>
                        <Select name="actor_type" value={filters.actor_type} onChange={handleFilterChange} suppressHydrationWarning>
                            <option value="">All Actors</option>
                            <option value="admin">Admin</option>
                            <option value="system">System</option>
                            <option value="tenant">Tenant</option>
                        </Select>
                    </div>
                    <div className="space-y-1.5 lg:col-span-1 xl:col-span-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 ml-1">
                            <Mail className="w-3 h-3" /> Actor Email
                        </label>
                        <Input
                            name="actor_email"
                            placeholder="Search email..."
                            value={filters.actor_email}
                            onChange={handleFilterChange}
                            className="h-8"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 ml-1">
                            <Shield className="w-3 h-3" /> Status
                        </label>
                        <Select name="status" value={filters.status} onChange={handleFilterChange} suppressHydrationWarning>
                            <option value="">All Status</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                        </Select>
                    </div>
                    <div className="space-y-1.5 xl:col-span-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 ml-1">
                            <Activity className="w-3 h-3" /> Action
                        </label>
                        <Input
                            name="action"
                            placeholder="Search action..."
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="h-8"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 ml-1">
                            <Clock className="w-3 h-3" /> Start Date
                        </label>
                        <Input
                            type="date"
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="h-8"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 ml-1">
                            <Clock className="w-3 h-3" /> End Date
                        </label>
                        <Input
                            type="date"
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="h-8"
                            suppressHydrationWarning
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 flex-1 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 text-xs font-medium" onClick={clearFilters}>
                            <FilterX className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                            Clear
                        </Button>
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-100/30 dark:bg-zinc-900/30 border-b border-zinc-200/50 dark:border-zinc-800/50">
                                <TableHead className="w-[40px]"></TableHead>
                                <TableHead className="w-[180px] font-bold text-xs">Timestamp</TableHead>
                                <TableHead className="min-w-[280px] font-bold text-xs">Actor</TableHead>
                                <TableHead className="font-bold text-xs text-center w-[120px]">Resource</TableHead>
                                <TableHead className="font-bold text-xs">Action</TableHead>
                                <TableHead className="w-[100px] font-bold text-xs">Status</TableHead>
                                <TableHead className="w-[120px] font-bold text-xs">IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="animate-pulse border-b border-zinc-200/50 dark:border-zinc-800/50">
                                        <TableCell className="text-center">
                                            <div className="w-3.5 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                                <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md mx-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Activity className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                                            <span className="text-sm text-zinc-500 font-medium">No audit logs found.</span>
                                            <p className="text-xs text-zinc-400">Try adjusting your filters to see more results.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <TableRow
                                            className={`text-[11px] group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors cursor-pointer ${expandedRows.has(log.id) ? 'bg-zinc-50/50 dark:bg-zinc-900/30' : ''}`}
                                            onClick={() => toggleRow(log.id)}
                                        >
                                            <TableCell className="p-0 text-center">
                                                {expandedRows.has(log.id) ? <ChevronUp className="w-3.5 h-3.5 mx-auto text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 mx-auto text-zinc-400 group-hover:text-zinc-600" />}
                                            </TableCell>
                                            <TableCell className="text-zinc-500 font-mono">
                                                {formatDate(log.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight text-[10px]">{log.actor_type}</span>
                                                        <span className="text-zinc-400">•</span>
                                                        <span className="font-medium text-zinc-600 dark:text-zinc-400 break-all">
                                                            {log.actor_email || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400 font-mono break-all">
                                                        {log.actor_id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {log.resource_type ? (
                                                    <Badge variant="outline" className="text-[9px] h-4 font-mono border-zinc-200 dark:border-zinc-800">
                                                        {log.resource_type}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-zinc-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-700/50 font-bold text-indigo-600 dark:text-indigo-400">
                                                    {log.action}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(log.status)}
                                            </TableCell>
                                            <TableCell className="text-zinc-500 font-mono">
                                                {log.ip_address || 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                        {expandedRows.has(log.id) && (
                                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200/50 dark:border-zinc-800/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <TableCell colSpan={7} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                                <Info className="w-3.5 h-3.5 text-indigo-500" />
                                                                Log Metadata
                                                            </div>
                                                            <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 p-3 shadow-inner">
                                                                <pre className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                                                    {JSON.stringify(log.metadata || {}, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                                <Database className="w-3.5 h-3.5 text-emerald-500" />
                                                                Technical Details
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 p-2.5">
                                                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">User Agent</p>
                                                                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 line-clamp-3 break-all" title={log.user_agent}>
                                                                        {log.user_agent || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 p-2.5">
                                                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Resource ID</p>
                                                                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono break-all">
                                                                        {log.resource_id || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                {log.error_message && (
                                                                    <div className="col-span-2 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100/50 dark:border-red-900/30 p-2.5">
                                                                        <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Error Message</p>
                                                                        <p className="text-[10px] text-red-700 dark:text-red-300 font-medium italic">
                                                                            {log.error_message}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-medium">
                        Showing <span className="text-zinc-900 dark:text-zinc-100 font-bold">{logs.length}</span> of <span className="text-zinc-900 dark:text-zinc-100 font-bold">{pagination.total_count}</span> entries
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1 || loading}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="h-7 w-7 p-0 bg-white dark:bg-zinc-900 shadow-sm border-zinc-200/50 dark:border-zinc-800/50"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 min-w-[80px] text-center">
                            PAGE {pagination.page} / {pagination.total_pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.total_pages || loading}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="h-7 w-7 p-0 bg-white dark:bg-zinc-900 shadow-sm border-zinc-200/50 dark:border-zinc-800/50"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </Card>

            <Modal
                isOpen={isRotateModalOpen}
                onClose={() => setIsRotateModalOpen(false)}
                title="Rotate Audit Logs"
                description="Maintenance: This will permanently delete old logs to save database space."
                footer={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setIsRotateModalOpen(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
                            onClick={handleRotate}
                            disabled={rotating}
                        >
                            {rotating ? <LoadingSpinner className="w-3.5 h-3.5 mr-2" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
                            Execute Rotation
                        </Button>
                    </>
                }
            >
                <div className="space-y-5 py-2">
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-tight text-zinc-500 ml-1">Log Retention Period</label>
                        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    type="number"
                                    value={rotateDays}
                                    onChange={(e) => setRotateDays(parseInt(e.target.value) || 0)}
                                    min="1"
                                    className="w-20 h-8 font-bold text-center"
                                    suppressHydrationWarning
                                />
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Days of logs to keep</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 p-3.5 rounded-lg border border-red-100 dark:border-red-900/30 flex gap-3">
                        <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-tight">Destructive Action</p>
                            <p className="text-[11px] leading-relaxed text-red-600 dark:text-red-300 opacity-90">
                                This action is irreversible. All records older than {rotateDays} days will be deleted.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

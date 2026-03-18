'use client';

import { useAuth } from '@/store/authContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Shield, Calendar, LogOut, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const { toast } = useToast();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Change Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    // Visibility state
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const toggleShowPassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePassword = () => {
        const errors = {};
        const { new: newPass, confirm: confirmPass } = passwords;

        if (newPass.length < 8) {
            errors.new = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(newPass)) {
            errors.new = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(newPass)) {
            errors.new = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(newPass)) {
            errors.new = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPass)) {
            errors.new = 'Password must contain at least one special character';
        }

        if (newPass !== confirmPass) {
            errors.confirm = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmitPasswordChange = async (e) => {
        e.preventDefault();

        if (!validatePassword()) return;

        try {
            setIsChangingPassword(true);
            await authService.changePassword(passwords.current, passwords.new);

            toast({
                title: 'Password Changed',
                description: 'Redirecting to login for security...',
                variant: 'success',
                duration: 2000
            });

            // Short delay to allow user to see the success message
            setTimeout(() => {
                logout();
            }, 1000);
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to change password. Please check your current password.',
                variant: 'destructive'
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
    };

    if (loading) {
        return <div className="h-96 flex items-center justify-center"><LoadingSpinner className="w-8 h-8" /></div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Profile</h1>
                    <p className="text-zinc-500">Manage your account settings and preferences.</p>
                </div>
                <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold">
                            {user.full_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.full_name}</h2>
                            <p className="text-sm text-zinc-500">{user.email}</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                            Administrator
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>User information and access level</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase flex items-center gap-1">
                                    <User className="w-3 h-3" /> Full Name
                                </label>
                                <div className="font-medium">{user.full_name}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <div className="font-medium">{user.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Role
                                </label>
                                <div className="font-medium capitalize">{user.role || 'Admin'}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Join Date
                                </label>
                                <div className="font-medium">
                                    {/* Assuming user details might have created_at, if not just show N/A or hide */}
                                    {user.created_at ? formatDate(user.created_at) : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-sm font-medium mb-3">Permissions</h3>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">Manage Tenants</Badge>
                                <Badge variant="outline">Manage Sync Tokens</Badge>
                                <Badge variant="outline">System Overview</Badge>
                                <Badge variant="outline">User Management</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your password and security settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmitPasswordChange} className="space-y-4 max-w-md">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="current"
                                        placeholder="Enter current password"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowPassword('current')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                        tabIndex={-1}
                                    >
                                        {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="new"
                                            placeholder="Min 8 chars, mixed case & symbols"
                                            value={passwords.new}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowPassword('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                            tabIndex={-1}
                                        >
                                            {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {passwordErrors.new && (
                                        <p className="text-xs text-red-500">{passwordErrors.new}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirm"
                                            placeholder="Confirm new password"
                                            value={passwords.confirm}
                                            onChange={handlePasswordChange}
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShowPassword('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                            tabIndex={-1}
                                        >
                                            {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirm && (
                                        <p className="text-xs text-red-500">{passwordErrors.confirm}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm}>
                                    {isChangingPassword ? (
                                        <>
                                            <LoadingSpinner className="mr-2 h-3 w-3" />
                                            Updating...
                                        </>
                                    ) : 'Change Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Confirm Logout"
                description="Are you sure you want to log out of the admin dashboard?"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmLogout}>
                            Logout
                        </Button>
                    </>
                }
            />
        </div>
    );
}

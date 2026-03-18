'use client';

import { useState } from 'react';
import { useAuth } from '@/store/authContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-none bg-transparent sm:border sm:border-zinc-200/50 sm:bg-white/50 sm:backdrop-blur-xl">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs flex items-center gap-2 dark:bg-red-950/50 dark:text-red-400">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoadingSpinner className="mr-2 h-3 w-3" />
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

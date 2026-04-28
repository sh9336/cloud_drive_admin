import { Card, CardContent } from '@/components/ui/Card';
import { LoginForm } from './LoginForm';

export const metadata = {
    title: 'Login - CloudAdmin',
    description: 'Sign in to CloudAdmin dashboard',
};

export default function LoginPage() {
    return (
        <Card className="border-0 shadow-none bg-transparent sm:border sm:border-zinc-200/50 sm:bg-white/50 sm:backdrop-blur-xl">
            <CardContent className="pt-6">
                <LoginForm />
            </CardContent>
        </Card>
    );
}

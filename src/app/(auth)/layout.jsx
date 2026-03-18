export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="w-full max-w-xs space-y-8">
                {/* Minimalist Brand Identifier */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <div className="w-5 h-5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-sm bg-zinc-400 dark:bg-zinc-500" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest">CloudAdmin</span>
                    </div>
                </div>

                {children}

                <div className="text-center">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        System Access Only
                    </p>
                </div>
            </div>
        </div>
    );
}

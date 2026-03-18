'use client';

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
        variants: {
            variant: {
                default: "border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
                destructive:
                    "destructive group border-red-500 bg-red-500 text-zinc-50 dark:border-red-900 dark:bg-red-900 dark:text-zinc-50",
                success:
                    "border-green-500 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-900/20 dark:text-green-50",
                warning:
                    "border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-50"
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const ToastContext = React.createContext({})

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([])

    const toast = React.useCallback(({ title, description, variant = "default", duration = 5000 }) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, title, description, variant, duration }])

        if (duration !== Infinity) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, duration)
        }
    }, [])

    const dismiss = React.useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <ToastViewport>
                {toasts.map((t) => (
                    <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
                ))}
            </ToastViewport>
        </ToastContext.Provider>
    )
}

export const useToast = () => React.useContext(ToastContext)

function ToastViewport({ children }) {
    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {children}
        </div>
    )
}

function Toast({ id, title, description, variant, onDismiss }) {
    const Icon = {
        default: Info,
        destructive: AlertCircle,
        success: CheckCircle,
        warning: AlertTriangle
    }[variant] || Info

    return (
        <div className={cn(toastVariants({ variant }), "mb-2")}>
            <div className="flex gap-3 items-start">
                {variant !== 'default' && <Icon className="w-5 h-5 mt-0.5 shrink-0" />}
                <div className="grid gap-1">
                    {title && <div className="text-sm font-semibold">{title}</div>}
                    {description && <div className="text-sm opacity-90">{description}</div>}
                </div>
            </div>
            <button
                onClick={onDismiss}
                className="absolute right-2 top-2 rounded-md p-1 text-inherit opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

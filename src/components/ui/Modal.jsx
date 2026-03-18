import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./Button"

const Modal = ({ isOpen, onClose, title, description, children, footer }) => {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 mx-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
                        {description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-4 h-4 text-zinc-500" />
                    </button>
                </div>

                <div className="py-2">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-2 pt-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}

export { Modal }

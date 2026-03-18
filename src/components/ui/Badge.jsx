import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300",
    {
        variants: {
            variant: {
                default:
                    "border-zinc-200/50 bg-zinc-100 text-zinc-700 hover:bg-zinc-200/50 dark:border-zinc-800/50 dark:bg-zinc-800 dark:text-zinc-200",
                secondary:
                    "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
                success:
                    "border-emerald-200/50 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-400",
                destructive:
                    "border-red-200/50 bg-red-50/50 text-red-700 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-400",
                warning:
                    "border-amber-200/50 bg-amber-50/50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-400",
                outline: "text-zinc-950 dark:text-zinc-50",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

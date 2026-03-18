import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <select
            className={cn(
                "flex h-8 w-full rounded-md border border-zinc-200/50 bg-white/50 px-3 py-1 text-xs shadow-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/50 dark:bg-zinc-950/50 dark:focus-visible:ring-zinc-600 appearance-none cursor-pointer",
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </select>
    )
})
Select.displayName = "Select"

export { Select }

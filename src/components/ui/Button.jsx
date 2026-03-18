import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const variants = {
        default: "bg-zinc-900 text-white hover:bg-zinc-800",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-zinc-200/50 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/50 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
        ghost: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-500",
    }

    const sizes = {
        default: "h-8 px-3 text-xs",
        sm: "h-7 rounded-md px-2 text-[10px]",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
    }

    return (
        <Comp
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }

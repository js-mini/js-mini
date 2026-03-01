import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'glass', size?: 'sm' | 'default' | 'lg' }>(
    ({ className = "", variant = "primary", size = "default", ...props }, ref) => {

        // Base styles: inline-flex, centered, transition, rounded-md, font-medium, crisp borders
        let baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none"

        // Variant styles
        let variantStyles = ""
        switch (variant) {
            case "primary":
                // Vercel style primary: Solid white text on black (or inverted), but here we keep the gold as the accent brand color, toned down slightly.
                variantStyles = "bg-white text-black hover:bg-zinc-200 border border-transparent shadow-sm"
                break
            case "outline":
                // Vercel style secondary: Transparent background, subtle border, hover background
                variantStyles = "bg-transparent border border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-white"
                break
            case "ghost":
                variantStyles = "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                break
            case "glass":
                // A special premium version using the gold brand color
                variantStyles = "bg-[#f3b820] text-black hover:bg-[#d9a21b] border border-[#f3b820]/50 shadow-[0_0_15px_rgba(243,184,32,0.15)]"
                break
        }

        // Size styles
        let sizeStyles = ""
        switch (size) {
            case "sm":
                sizeStyles = "px-3 py-1.5 text-xs"
                break
            case "default":
                sizeStyles = "px-5 py-2.5 text-sm"
                break
            case "lg":
                sizeStyles = "px-8 py-4 text-base"
                break
        }

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

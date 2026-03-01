import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'glass', size?: 'sm' | 'default' | 'lg' }>(
    ({ className = "", variant = "primary", size = "default", ...props }, ref) => {

        // Base styles: inline-flex, centered, transition, rounded, font-medium
        let baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none focus:ring-offset-[#0a0a0a]"

        // Variant styles
        let variantStyles = ""
        switch (variant) {
            case "primary":
                variantStyles = "bg-[#D4AF37] text-black hover:bg-[#B5952F] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-95"
                break
            case "outline":
                variantStyles = "border border-white/20 text-white hover:bg-white/10 active:scale-95 backdrop-blur-sm"
                break
            case "ghost":
                variantStyles = "text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
                break
            case "glass":
                variantStyles = "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md active:scale-95"
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

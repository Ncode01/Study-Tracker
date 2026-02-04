import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GradientButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
}

const gradients = {
    primary: 'from-violet-600 via-purple-600 to-indigo-600',
    secondary: 'from-emerald-600 via-teal-600 to-cyan-600',
    danger: 'from-red-600 via-rose-600 to-pink-600',
};

const glows = {
    primary: 'shadow-violet-500/30',
    secondary: 'shadow-emerald-500/30',
    danger: 'shadow-red-500/30',
};

export function GradientButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    icon,
    ...props
}: GradientButtonProps) {
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm gap-1.5',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-2.5',
    };

    return (
        <motion.button
            whileHover={{ scale: props.disabled ? 1 : 1.02, y: props.disabled ? 0 : -2 }}
            whileTap={{ scale: props.disabled ? 1 : 0.98 }}
            onClick={onClick}
            {...props}
            className={cn(
                "relative overflow-hidden rounded-xl font-bold flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-r", gradients[variant],
                "shadow-xl", glows[variant],
                sizeClasses[size],
                props.disabled && "opacity-50 cursor-not-allowed",
                props.className
            )}
        >
            {/* Animated shine */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            {/* Glow effect on hover */}
            <motion.div
                className="absolute inset-0 opacity-0 blur-xl bg-white/20"
                whileHover={{ opacity: 0.5 }}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2 text-white">
                {icon && <span>{icon}</span>}
                {children}
            </span>
        </motion.button>
    );
}

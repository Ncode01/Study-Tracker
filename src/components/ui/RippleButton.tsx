import { useState, type ReactNode, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface RippleButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    icon?: ReactNode;
    loading?: boolean;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
}

export function RippleButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className,
    icon,
    loading = false,
}: RippleButtonProps) {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const variantClasses = {
        primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25',
        secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
        ghost: 'bg-transparent hover:bg-white/10 text-white',
        danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-base gap-2',
        lg: 'px-6 py-3 text-lg gap-2.5',
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);

        onClick?.();
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={handleClick}
            disabled={disabled || loading}
            className={cn(
                "relative overflow-hidden rounded-xl font-medium transition-all duration-200 flex items-center justify-center",
                variantClasses[variant],
                sizeClasses[size],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {/* Ripple effects */}
            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.span
                        key={ripple.id}
                        className="absolute bg-white/30 rounded-full pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                        }}
                        initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
                        animate={{
                            width: 200,
                            height: 200,
                            x: -100,
                            y: -100,
                            opacity: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>

            {/* Loading spinner */}
            {loading && (
                <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            )}

            {/* Icon */}
            {!loading && icon && <span>{icon}</span>}

            {/* Text */}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}

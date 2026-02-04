import { forwardRef, type InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlowInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-muted-foreground">
                        {label}
                    </label>
                )}

                <div className="relative group">
                    {/* Glow effect */}
                    <motion.div
                        className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 blur group-focus-within:opacity-50 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                    />

                    <div className="relative flex items-center">
                        {icon && (
                            <span className="absolute left-3 text-muted-foreground">
                                {icon}
                            </span>
                        )}

                        <input
                            ref={ref}
                            className={cn(
                                "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground",
                                "focus:outline-none focus:border-violet-500/50 focus:bg-white/10",
                                "transition-all duration-300",
                                icon && "pl-10",
                                error && "border-red-500/50",
                                className
                            )}
                            {...props}
                        />
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

GlowInput.displayName = 'GlowInput';

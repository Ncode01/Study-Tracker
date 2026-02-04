import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Crown } from "lucide-react";

interface LevelBadgeProps {
    level: number;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
    const sizeClasses = {
        sm: "w-10 h-10 text-sm",
        md: "w-14 h-14 text-base",
        lg: "w-20 h-20 text-xl",
    };

    const iconSizes = {
        sm: 12,
        md: 16,
        lg: 24,
    };

    return (
        <motion.div
            className={cn(
                "relative flex items-center justify-center",
                sizeClasses[size],
                className
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 blur-lg opacity-50 animate-pulse" />

            {/* Main badge */}
            <div className={cn(
                "relative flex items-center justify-center rounded-full",
                "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700",
                "border-2 border-amber-400/50 shadow-2xl",
                sizeClasses[size]
            )}>
                {/* Inner gradient overlay */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

                {/* Crown icon for high levels */}
                {level >= 5 && (
                    <Crown
                        size={iconSizes[size]}
                        className="absolute -top-1 text-amber-400 drop-shadow-lg"
                        style={{ transform: 'translateY(-50%)' }}
                    />
                )}

                {/* Level number */}
                <span className="font-black text-white z-10 drop-shadow-lg">
                    {level}
                </span>
            </div>

            {/* Particle effect (decorative) */}
            <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                {[...Array(size === "lg" ? 6 : 4)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400 rounded-full"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * (360 / (size === "lg" ? 6 : 4))}deg) translateY(-${size === "lg" ? 45 : 30}px)`,
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}

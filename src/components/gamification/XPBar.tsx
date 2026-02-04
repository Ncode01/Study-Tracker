import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

interface XPBarProps {
    progress: number;
    level: number;
    xp: number;
    className?: string;
}

export function XPBar({ progress, level, xp, className }: XPBarProps) {
    return (
        <div className={cn("w-full space-y-3", className)}>
            <div className="flex justify-between items-end text-sm">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-gradient-primary">Level {level}</span>
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                    {xp} XP • {Math.round(progress)}% to next
                </span>
            </div>

            <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                {/* Animated shimmer background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

                {/* Progress bar */}
                <motion.div
                    className="h-full relative rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
                >
                    {/* Gradient fill */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500" />

                    {/* Animated shine */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                </motion.div>
            </div>
        </div>
    );
}

import { motion } from 'framer-motion';
import { Flame, Snowflake } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakWidgetProps {
    streak: number;
    className?: string;
}

export function StreakWidget({ streak, className }: StreakWidgetProps) {
    const isActive = streak > 0;
    const intensity = Math.min(streak / 10, 1); // Max intensity at 10 days

    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-2xl p-4",
                isActive
                    ? "bg-gradient-to-br from-orange-500/20 via-red-500/20 to-amber-500/20 border border-orange-500/30"
                    : "bg-white/5 border border-white/10",
                className
            )}
            whileHover={{ scale: 1.02 }}
        >
            {/* Animated fire background */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{
                        background: [
                            'radial-gradient(circle at 50% 100%, rgba(251, 146, 60, 0.5) 0%, transparent 50%)',
                            'radial-gradient(circle at 30% 100%, rgba(239, 68, 68, 0.5) 0%, transparent 50%)',
                            'radial-gradient(circle at 70% 100%, rgba(251, 146, 60, 0.5) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="relative z-10 flex items-center gap-4">
                <div className="relative">
                    {isActive ? (
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [-5, 5, -5],
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            <Flame
                                size={40}
                                className="text-orange-400"
                                style={{
                                    filter: `drop-shadow(0 0 ${10 + intensity * 10}px rgba(251, 146, 60, ${0.5 + intensity * 0.5}))`
                                }}
                            />
                        </motion.div>
                    ) : (
                        <Snowflake size={40} className="text-zinc-500" />
                    )}

                    {/* Flame particles */}
                    {isActive && (
                        <div className="absolute inset-0">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-orange-400"
                                    style={{ left: '50%', bottom: 0 }}
                                    animate={{
                                        y: [-10, -30],
                                        x: [0, (i - 1) * 10],
                                        opacity: [1, 0],
                                        scale: [1, 0],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <motion.div
                        className={cn(
                            "text-3xl font-black",
                            isActive ? "text-orange-400" : "text-zinc-500"
                        )}
                        key={streak}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {streak}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">
                        {streak === 1 ? 'Day Streak' : 'Day Streak'}
                    </div>
                </div>
            </div>

            {/* Streak milestones */}
            <div className="mt-3 flex gap-1">
                {[3, 7, 14, 30].map((milestone) => (
                    <div
                        key={milestone}
                        className={cn(
                            "flex-1 h-1 rounded-full transition-colors",
                            streak >= milestone
                                ? "bg-gradient-to-r from-orange-400 to-amber-400"
                                : "bg-white/10"
                        )}
                    />
                ))}
            </div>
        </motion.div>
    );
}

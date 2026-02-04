import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { type Achievement, RARITY_COLORS } from '../../types/achievements';

interface AchievementBadgeProps {
    achievement: Achievement;
    isUnlocked: boolean;
    progress?: number;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

export function AchievementBadge({
    achievement,
    isUnlocked,
    progress = 0,
    size = 'md',
    showDetails = true,
}: AchievementBadgeProps) {
    const colors = RARITY_COLORS[achievement.rarity];

    const sizeClasses = {
        sm: 'w-12 h-12 text-lg',
        md: 'w-16 h-16 text-2xl',
        lg: 'w-24 h-24 text-4xl',
    };

    return (
        <motion.div
            className={cn(
                "relative group",
                !showDetails && sizeClasses[size]
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Badge */}
            <div
                className={cn(
                    "relative flex items-center justify-center rounded-2xl border-2 transition-all duration-300",
                    sizeClasses[size],
                    isUnlocked
                        ? cn(colors.bg, colors.border, "shadow-lg", colors.glow)
                        : "bg-zinc-900/50 border-zinc-700/50 grayscale"
                )}
            >
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                    <motion.div
                        className={cn(
                            "absolute -inset-1 rounded-2xl blur-lg opacity-50",
                            colors.bg
                        )}
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}

                {/* Icon or lock */}
                <span className={cn(
                    "relative z-10 transition-transform",
                    isUnlocked ? "" : "opacity-30"
                )}>
                    {isUnlocked ? (
                        <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 10 }}
                        >
                            {achievement.icon}
                        </motion.span>
                    ) : (
                        <Lock size={size === 'lg' ? 32 : size === 'md' ? 24 : 16} className="text-zinc-500" />
                    )}
                </span>

                {/* Progress ring for locked achievements */}
                {!isUnlocked && progress > 0 && (
                    <svg
                        className="absolute inset-0 -rotate-90"
                        viewBox="0 0 100 100"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-zinc-700"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className={colors.text}
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                        />
                    </svg>
                )}
            </div>

            {/* Details */}
            {showDetails && (
                <div className="mt-2 text-center">
                    <p className={cn(
                        "font-bold text-sm truncate",
                        isUnlocked ? colors.text : "text-zinc-500"
                    )}>
                        {achievement.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                    </p>
                    <p className={cn(
                        "text-xs font-bold mt-1",
                        isUnlocked ? "text-amber-400" : "text-zinc-600"
                    )}>
                        +{achievement.xpReward} XP
                    </p>
                </div>
            )}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <p className="text-sm font-bold">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {!isUnlocked && <p className="text-xs text-amber-400 mt-1">{Math.round(progress)}% complete</p>}
            </div>
        </motion.div>
    );
}

// Grid of achievement badges
interface AchievementGridProps {
    achievements: Achievement[];
    unlockedIds: string[];
    getProgress: (a: Achievement) => number;
}

export function AchievementGrid({ achievements, unlockedIds, getProgress }: AchievementGridProps) {
    return (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {achievements.map((achievement) => (
                <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={unlockedIds.includes(achievement.id)}
                    progress={getProgress(achievement)}
                    size="md"
                />
            ))}
        </div>
    );
}

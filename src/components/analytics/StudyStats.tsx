import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Trophy, BookOpen, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface StudyStatsProps {
    totalHours: number;
    totalSessions: number;
    totalTasks: number;
    avgSessionLength: number;
    currentStreak: number;
    topSubject: string;
}

export function StudyStats({
    totalHours,
    totalSessions,
    totalTasks,
    avgSessionLength,
    currentStreak,
    topSubject,
}: StudyStatsProps) {
    const stats = [
        { label: 'Total Study Time', value: totalHours, suffix: 'h', icon: Clock, color: 'text-violet-400' },
        { label: 'Focus Sessions', value: totalSessions, icon: Target, color: 'text-emerald-400' },
        { label: 'Tasks Completed', value: totalTasks, icon: Trophy, color: 'text-amber-400' },
        { label: 'Avg Session', value: avgSessionLength, suffix: 'm', icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Current Streak', value: currentStreak, suffix: ' days', icon: Flame, color: 'text-orange-400' },
        { label: 'Top Subject', value: topSubject, isText: true, icon: BookOpen, color: 'text-pink-400' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <stat.icon size={16} className={stat.color} />
                        <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    </div>

                    {stat.isText ? (
                        <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                    ) : (
                        <p className={cn("text-2xl font-black", stat.color)}>
                            <AnimatedCounter value={stat.value as number} suffix={stat.suffix} />
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

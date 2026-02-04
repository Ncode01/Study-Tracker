import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SUBJECT_COLORS, type Subject } from '../../types';
import { cn } from '../../lib/utils';
import { ProgressRing } from '../ui/ProgressRing';

interface SubjectMasteryData {
    subject: Subject;
    mastery: number; // 0-100
    trend: 'up' | 'down' | 'stable';
    studyHours: number;
    testsCompleted: number;
}

interface SubjectMasteryProps {
    data: SubjectMasteryData[];
}

export function SubjectMastery({ data }: SubjectMasteryProps) {
    const getMasteryLevel = (mastery: number) => {
        if (mastery >= 90) return { label: 'Master', color: 'text-amber-400' };
        if (mastery >= 70) return { label: 'Expert', color: 'text-purple-400' };
        if (mastery >= 50) return { label: 'Intermediate', color: 'text-blue-400' };
        if (mastery >= 30) return { label: 'Beginner', color: 'text-green-400' };
        return { label: 'Novice', color: 'text-zinc-400' };
    };

    const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={14} className="text-emerald-400" />;
            case 'down':
                return <TrendingDown size={14} className="text-red-400" />;
            default:
                return <Minus size={14} className="text-zinc-400" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item, index) => {
                const level = getMasteryLevel(item.mastery);
                const color = SUBJECT_COLORS[item.subject];

                return (
                    <motion.div
                        key={item.subject}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:border-white/20 transition-all cursor-pointer"
                    >
                        {/* Background glow */}
                        <div
                            className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-30"
                            style={{ backgroundColor: color }}
                        />

                        <div className="relative z-10 flex items-start gap-4">
                            {/* Progress ring */}
                            <ProgressRing
                                progress={item.mastery}
                                size={60}
                                strokeWidth={5}
                                showPercentage={false}
                            >
                                <span className="text-xs font-bold">{item.mastery}%</span>
                            </ProgressRing>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <h4 className="font-bold truncate">{item.subject}</h4>
                                    <TrendIcon trend={item.trend} />
                                </div>

                                <p className={cn("text-sm font-medium", level.color)}>
                                    {level.label}
                                </p>

                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>{item.studyHours}h studied</span>
                                    <span>{item.testsCompleted} tests</span>
                                </div>
                            </div>
                        </div>

                        {/* Mastery bar */}
                        <div className="mt-4">
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.mastery}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

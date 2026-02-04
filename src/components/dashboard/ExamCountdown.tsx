import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { EXAM_SCHEDULE } from '../../types';
import { getDaysUntilExam, formatDate } from '../../utils';
import { cn } from '../../lib/utils';

export function ExamCountdown() {
    const upcomingExams = useMemo(() => {
        const today = new Date();
        return EXAM_SCHEDULE
            .filter((exam) => new Date(exam.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, []);

    const nextExam = upcomingExams[0];
    const daysUntil = nextExam ? getDaysUntilExam(nextExam.date) : 0;
    const isUrgent = daysUntil <= 7;

    if (!nextExam) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming exams</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative overflow-hidden rounded-2xl p-6",
                isUrgent
                    ? "bg-gradient-to-br from-red-500/20 via-orange-500/20 to-amber-500/20 border border-red-500/30"
                    : "bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-indigo-500/20 border border-violet-500/30"
            )}
        >
            {/* Animated background pulse for urgent */}
            {isUrgent && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        {isUrgent ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : (
                            <Calendar className="w-5 h-5 text-violet-400" />
                        )}
                        <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                            Next Exam
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatDate(nextExam.date)}
                    </span>
                </div>

                <h3 className={cn(
                    "text-xl font-bold mb-4",
                    isUrgent ? "text-gradient-accent" : "text-gradient-primary"
                )}>
                    {nextExam.subject}
                </h3>

                {/* Countdown display */}
                <div className="flex items-end gap-6">
                    <div>
                        <motion.span
                            key={daysUntil}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                                "text-5xl font-black",
                                isUrgent ? "text-red-400" : "text-violet-400"
                            )}
                        >
                            {daysUntil}
                        </motion.span>
                        <span className="ml-2 text-muted-foreground">days</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{Math.ceil(daysUntil / 7)} weeks</span>
                    </div>
                </div>

                {/* Progress bar until exam */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Time remaining</span>
                        <span>{Math.max(0, 100 - Math.round((1 - daysUntil / 30) * 100))}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={cn(
                                "h-full",
                                isUrgent ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-violet-500 to-purple-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0, 100 - Math.round((daysUntil / 30) * 100))}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

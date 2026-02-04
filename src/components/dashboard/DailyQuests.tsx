import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { useGamification } from '../../hooks/useGamification';

interface Quest {
    id: string;
    text: string;
    xp: number;
    completed: boolean;
    icon?: typeof Zap;
}

export function DailyQuests() {
    const { addXP } = useGamification();
    const [quests, setQuests] = useState<Quest[]>([
        { id: '1', text: 'Log in today', xp: 10, completed: true, icon: Star },
        { id: '2', text: 'Complete 25 min focus session', xp: 50, completed: false, icon: Zap },
        { id: '3', text: 'Finish 3 tasks', xp: 30, completed: false },
        { id: '4', text: 'Review Mathematics notes', xp: 20, completed: false },
    ]);

    const handleComplete = (id: string) => {
        setQuests(prev => prev.map(q => {
            if (q.id === id && !q.completed) {
                addXP(q.xp);
                return { ...q, completed: true };
            }
            return q;
        }));
    };

    const completedCount = quests.filter(q => q.completed).length;
    const progress = (completedCount / quests.length) * 100;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            {/* Background gradient */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span className="text-gradient-accent">Daily Quests</span>
                    </h3>
                    <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {completedCount}/{quests.length}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {quests.map((quest) => (
                            <motion.div
                                key={quest.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                whileHover={{ scale: quest.completed ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300",
                                    quest.completed
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/30"
                                )}
                                onClick={() => handleComplete(quest.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{
                                            scale: quest.completed ? [1, 1.2, 1] : 1,
                                            rotate: quest.completed ? [0, 10, -10, 0] : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {quest.completed ? (
                                            <CheckCircle2 className="text-emerald-400" size={20} />
                                        ) : (
                                            <Circle className="text-muted-foreground" size={20} />
                                        )}
                                    </motion.div>
                                    <span className={cn(
                                        "text-sm font-medium transition-all",
                                        quest.completed && "line-through text-muted-foreground"
                                    )}>
                                        {quest.text}
                                    </span>
                                </div>
                                <motion.span
                                    className={cn(
                                        "text-xs font-bold px-2.5 py-1 rounded-full",
                                        quest.completed
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/20 text-amber-400"
                                    )}
                                    animate={{
                                        scale: quest.completed ? [1, 1.1, 1] : 1
                                    }}
                                >
                                    +{quest.xp} XP
                                </motion.span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

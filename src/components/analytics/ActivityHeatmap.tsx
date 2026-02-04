import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface HeatmapProps {
    data: Record<string, number>; // date string -> activity count
    weeks?: number;
}

export function ActivityHeatmap({ data, weeks = 12 }: HeatmapProps) {
    const days = useMemo(() => {
        const result: { date: string; count: number; dayOfWeek: number }[] = [];
        const today = new Date();
        const totalDays = weeks * 7;

        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                count: data[dateStr] || 0,
                dayOfWeek: date.getDay(),
            });
        }
        return result;
    }, [data, weeks]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getColor = (count: number) => {
        if (count === 0) return 'bg-white/5';
        if (count <= 1) return 'bg-emerald-900/50';
        if (count <= 3) return 'bg-emerald-700/60';
        if (count <= 5) return 'bg-emerald-500/70';
        return 'bg-emerald-400';
    };

    // Group by weeks
    const weekGroups: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
        weekGroups.push(days.slice(i, i + 7));
    }

    return (
        <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1">
                {/* Day labels */}
                <div className="flex gap-1 ml-8">
                    {weekGroups.map((_, weekIdx) => (
                        <div key={weekIdx} className="w-3" />
                    ))}
                </div>

                {/* Grid */}
                <div className="flex gap-1">
                    {/* Row labels */}
                    <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pr-1">
                        {weekDays.map((day, i) => (
                            <div key={i} className="h-3 flex items-center">
                                {i % 2 === 1 ? day : ''}
                            </div>
                        ))}
                    </div>

                    {/* Cells */}
                    <div className="flex gap-1">
                        {weekGroups.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((day, dayIdx) => (
                                    <motion.div
                                        key={day.date}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: (weekIdx * 7 + dayIdx) * 0.005 }}
                                        className={cn(
                                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-white/30",
                                            getColor(day.count)
                                        )}
                                        title={`${day.date}: ${day.count} activities`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {['bg-white/5', 'bg-emerald-900/50', 'bg-emerald-700/60', 'bg-emerald-500/70', 'bg-emerald-400'].map((color, i) => (
                            <div key={i} className={cn("w-3 h-3 rounded-sm", color)} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}

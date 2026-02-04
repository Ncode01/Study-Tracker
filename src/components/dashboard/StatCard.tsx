import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: string;
    delay?: number;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, color = "primary", delay = 0 }: StatCardProps) {
    const colorClasses: Record<string, { bg: string, text: string, glow: string }> = {
        primary: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "shadow-violet-500/20" },
        secondary: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
        accent: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "shadow-amber-500/20" },
        blue: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20" },
        pink: { bg: "bg-pink-500/10", text: "text-pink-400", glow: "shadow-pink-500/20" },
    };

    const colorSet = colorClasses[color] || colorClasses.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={cn(
                "relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300",
                "bg-white/5 backdrop-blur-xl border border-white/10",
                "hover:border-white/20 hover:shadow-xl",
                colorSet.glow
            )}
        >
            {/* Gradient glow background */}
            <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30",
                colorSet.bg
            )} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        "p-3 rounded-xl",
                        colorSet.bg,
                        colorSet.text
                    )}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <span className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                            trendUp ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        )}>
                            {trend}
                        </span>
                    )}
                </div>
                <div className="space-y-1">
                    <p className={cn("text-3xl font-black tracking-tight", colorSet.text)}>{value}</p>
                    <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
                </div>
            </div>
        </motion.div>
    );
}

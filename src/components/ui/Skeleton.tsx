import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-white/5";

    const variantClasses = {
        default: "rounded-lg",
        circular: "rounded-full",
        text: "rounded h-4",
    };

    return (
        <div className={cn(baseClasses, variantClasses[variant], className)} />
    );
}

export function CardSkeleton() {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-1/3" />
                    <Skeleton variant="text" className="w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20" />
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton variant="circular" className="w-12 h-12" />
                <Skeleton variant="text" className="w-16" />
            </div>
            <div className="space-y-2">
                <Skeleton variant="text" className="w-20 h-8" />
                <Skeleton variant="text" className="w-24" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Skeleton variant="circular" className="w-6 h-6" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-3/4" />
                        <Skeleton variant="text" className="w-1/2" />
                    </div>
                    <Skeleton className="w-16 h-6" />
                </div>
            ))}
        </div>
    );
}

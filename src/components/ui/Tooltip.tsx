import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export function Tooltip({
    children,
    content,
    position = 'top',
    delay = 300
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800',
    };

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute z-50 px-3 py-2 text-sm bg-zinc-800 border border-white/10 rounded-lg shadow-xl whitespace-nowrap",
                            positionClasses[position]
                        )}
                    >
                        {content}
                        {/* Arrow */}
                        <div className={cn(
                            "absolute w-0 h-0 border-4 border-transparent",
                            arrowClasses[position]
                        )} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggeredListProps {
    children: ReactNode[];
    delay?: number;
    staggerDelay?: number;
    className?: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

export function StaggeredList({
    children,
    delay = 0,
    staggerDelay = 0.1,
    className
}: StaggeredListProps) {
    return (
        <motion.div
            className={className}
            variants={{
                ...containerVariants,
                visible: {
                    ...containerVariants.visible,
                    transition: {
                        ...containerVariants.visible.transition,
                        delayChildren: delay,
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            initial="hidden"
            animate="visible"
        >
            {children.map((child, index) => (
                <motion.div key={index} variants={itemVariants}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}

// Horizontal stagger for grids
export function StaggeredGrid({
    children,
    columns = 3,
    delay = 0,
    className
}: StaggeredListProps & { columns?: number }) {
    return (
        <motion.div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: '1rem'
            }}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        delayChildren: delay,
                        staggerChildren: 0.08,
                    } as any,
                },
            }}
        >
            {children.map((child, index) => (
                <motion.div
                    key={index}
                    variants={{
                        hidden: { opacity: 0, scale: 0.8, y: 30 },
                        visible: {
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: { type: 'spring', stiffness: 260, damping: 20 },
                        },
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}

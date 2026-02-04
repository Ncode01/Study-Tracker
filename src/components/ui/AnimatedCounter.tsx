import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function AnimatedCounter({
    value,
    duration = 1,
    className,
    prefix = '',
    suffix = '',
}: AnimatedCounterProps) {
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: duration * 1000
    });

    const display = useTransform(spring, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    useEffect(() => {
        return display.on('change', (v) => setDisplayValue(v));
    }, [display]);

    return (
        <motion.span
            className={className}
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {prefix}{displayValue.toLocaleString()}{suffix}
        </motion.span>
    );
}

// Simple count up on mount
export function CountUp({
    end,
    start = 0,
    duration = 2,
    className
}: {
    end: number;
    start?: number;
    duration?: number;
    className?: string;
}) {
    const [count, setCount] = useState(start);

    useEffect(() => {
        const steps = 60 * duration;
        const increment = (end - start) / steps;
        let current = start;
        let frame = 0;

        const interval = setInterval(() => {
            frame++;
            current += increment;
            setCount(Math.round(current));

            if (frame >= steps) {
                setCount(end);
                clearInterval(interval);
            }
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [end, start, duration]);

    return <span className={className}>{count.toLocaleString()}</span>;
}

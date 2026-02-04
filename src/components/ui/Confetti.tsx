import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
    shape: 'circle' | 'square' | 'star';
}

const COLORS = [
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#3b82f6', // blue
    '#ef4444', // red
];

function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
    }));
}

export function Confetti({ active, duration = 3000 }: { active: boolean; duration?: number }) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (active) {
            setParticles(generateParticles(50));
            const timer = setTimeout(() => setParticles([]), duration);
            return () => clearTimeout(timer);
        }
    }, [active, duration]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute"
                        style={{
                            left: `${particle.x}%`,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.shape !== 'star' ? particle.color : 'transparent',
                            borderRadius: particle.shape === 'circle' ? '50%' : 0,
                        }}
                        initial={{
                            y: -20,
                            opacity: 1,
                            rotate: particle.rotation,
                            scale: 0
                        }}
                        animate={{
                            y: '100vh',
                            opacity: [1, 1, 0],
                            rotate: particle.rotation + 720,
                            scale: [0, 1, 1, 0.5],
                            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 2 + Math.random(),
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                    >
                        {particle.shape === 'star' && (
                            <svg viewBox="0 0 24 24" fill={particle.color} className="w-full h-full">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// Floating XP particles
export function XPParticles({ amount, x, y }: { amount: number; x: number; y: number }) {
    return (
        <motion.div
            className="fixed pointer-events-none z-[150] font-bold text-amber-400"
            style={{ left: x, top: y }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
        >
            +{amount} XP
        </motion.div>
    );
}

// Sparkle effect
export function Sparkle({ className }: { className?: string }) {
    return (
        <motion.svg
            className={className}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0],
                opacity: [1, 0.8, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
            }}
        >
            <path
                fill="currentColor"
                d="M12 2L13.09 8.26L19 9.27L14.5 14.14L15.18 20.02L12 17.77L8.82 20.02L9.5 14.14L5 9.27L10.91 8.26L12 2Z"
            />
        </motion.svg>
    );
}

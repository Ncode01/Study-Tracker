import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Gradient mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_100%_100%,rgba(16,185,129,0.1),transparent)]" />

            {/* Floating orbs */}
            <motion.div
                className="absolute w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                style={{ top: '10%', left: '20%' }}
            />
            <motion.div
                className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                style={{ top: '50%', right: '10%' }}
            />
            <motion.div
                className="absolute w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                style={{ bottom: '20%', left: '30%' }}
            />

            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/20"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />
        </div>
    );
}

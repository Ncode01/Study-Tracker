import { useState, useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Card3DProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
    intensity?: number;
}

export function Card3D({
    children,
    className,
    glowColor = 'rgba(139, 92, 246, 0.3)',
    intensity = 15
}: Card3DProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
            }}
            className={cn(
                "relative rounded-2xl transition-shadow duration-300",
                isHovered && "shadow-2xl",
                className
            )}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 -z-10"
                style={{ background: glowColor }}
                animate={{ opacity: isHovered ? 0.6 : 0 }}
            />

            {/* Card content with 3D transform */}
            <div
                style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}
                className="relative"
            >
                {children}
            </div>

            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${isHovered ? '50%' : '100%'} ${isHovered ? '50%' : '100%'}, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                }}
            />
        </motion.div>
    );
}

// Simple hover lift card
export function CardHover({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn("cursor-pointer", className)}
        >
            {children}
        </motion.div>
    );
}

// Flip card for flashcards
interface FlipCardProps {
    front: ReactNode;
    back: ReactNode;
    className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className={cn("perspective-1000 cursor-pointer", className)}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {front}
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 backface-hidden"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
}

// src/components/ui/SmartHoverCard.tsx
import React, { useState, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Create a motion-enhanced Box with proper type casting
// Using 'as any' to avoid complex type incompatibilities between Chakra and Framer Motion
const MotionBox = motion(Box) as any;

interface SmartHoverCardProps extends Omit<BoxProps, 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onAnimationStart'> {
  children: React.ReactNode;
  depth?: number; // 0-1 scale for hover intensity
  rotateEffect?: boolean;
  scaleEffect?: boolean;
  glowEffect?: boolean;
  mood?: MoodType;
  glowColor?: string;
  perspective?: number;
  // Extend props with motion-specific props
  initial?: any;
  animate?: any;
  exit?: any;
  variants?: any;
  custom?: any;
  transition?: any;
  transformOrigin?: string;
  whileHover?: any;
  whileTap?: any;
  style?: any;
}

/**
 * A component that creates a sophisticated hover effect with 3D physics
 * Features spring animations, realistic shadows, and 3D transformations
 */
const SmartHoverCard = React.forwardRef<HTMLDivElement, SmartHoverCardProps>(({
  children,
  depth = 0.5,
  rotateEffect = true,
  scaleEffect = true,
  glowEffect = true,
  mood = 'focus',
  glowColor,
  perspective = 1200,
  initial,
  animate,
  exit,
  variants,
  custom,
  transition,
  whileHover,
  whileTap,
  style = {},
  ...rest
}, ref) => {
  // Get mood-based colors
  const palette = moodPalettes[mood];
  
  // Motion values for cursor position tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring physics for more natural movement
  const springConfig = { damping: 15, stiffness: 300 };
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), springConfig);
  
  // Scale based on hover state with spring physics
  const [isHovered, setIsHovered] = useState(false);
  const scale = useSpring(isHovered && scaleEffect ? 1.03 : 1, springConfig);
  
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Card elements - use passed ref or create our own
  const internalRef = useRef<HTMLDivElement>(null);
  const cardRef = ref || internalRef;
  
  // Custom transformer functions
  const createShadow = (inputs: number[]) => {
    const sX = inputs[0];
    const sY = inputs[1];
    return `${sX * depth}px ${sY * depth}px ${20 * depth}px rgba(0, 0, 0, ${0.3 * depth})`;
  };
  
  const createGlow = (inputs: number[]) => {
    const xVal = inputs[0];
    const yVal = inputs[1];
    const distance = Math.sqrt(xVal * xVal + yVal * yVal) / 100;
    return `0 0 ${10 + distance * 10}px ${glowColor || palette.accent}${Math.round(40 + distance * 20)}`;
  };
  
  // Dynamic shadow based on rotation with safer typing
  const shadowX = useTransform(rotateY, [-8, 8], [-5, 5]);
  const shadowY = useTransform(rotateX, [-8, 8], [-5, 5]);
  
  // Use the multi-input transform pattern that's type-safe
  const shadow = useTransform([shadowX, shadowY], createShadow);
  const glow = useTransform([x, y], createGlow);
  
  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef && 'current' in cardRef && cardRef.current && !prefersReducedMotion) {
      const rect = cardRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - rect.width / 2;
      const newY = e.clientY - rect.top - rect.height / 2;
      x.set(newX);
      y.set(newY);
    }
  };
  
  return (
    <MotionBox
      ref={cardRef}
      position="relative"
      initial={initial}
      animate={animate}
      exit={exit}
      variants={variants}
      custom={custom}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      onMouseMove={rotateEffect ? handleMouseMove : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false);
        // Reset position when not hovering
        if (!prefersReducedMotion) {
          x.set(0);
          y.set(0);
        }
      }}
      style={{ 
        scale,
        // Only apply 3D effects if not reduced motion
        ...(rotateEffect && !prefersReducedMotion ? { 
          rotateX,
          rotateY,
          z: 0
        } : {}),
        // Apply a glow effect on hover if enabled
        ...(glowEffect && isHovered ? { filter: glow } : {}),
        // Add user-provided style and preserve-3d
        ...style,
        transform: 'perspective(1200px)'
      }}
      sx={{
        transformStyle: 'preserve-3d',
        perspective: `${perspective}px`
      }}
      willChange="transform" // GPU acceleration hint
      {...rest}
    >
      {children}
      
      {/* Optional subtle light reflection overlay */}
      {isHovered && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          pointerEvents="none"
          bg="linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)"
          borderRadius="inherit"
          opacity={0.6}
          transition="opacity 0.2s ease"
          zIndex={1}
        />
      )}
    </MotionBox>
  );
});

SmartHoverCard.displayName = "SmartHoverCard";

export default SmartHoverCard;
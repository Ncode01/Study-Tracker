// src/components/ui/BreathingAnimation.tsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Motion components
const MotionBox = motion(Box);

interface BreathingAnimationProps extends BoxProps {
  size?: string;
  mood?: MoodType;
  isLoading?: boolean;
  pulseDuration?: number;
  children?: React.ReactNode;
}

/**
 * A component that creates a breathing animation effect
 * Can be used for loading indicators or to add subtle motion to UI elements
 */
const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  size = '40px',
  mood = 'focus',
  isLoading = true,
  pulseDuration = 3,
  children,
  transition: _ignoredTransition, // Omit Chakra's transition
  ...rest
}) => {
  const palette = moodPalettes[mood];
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Adjust animation based on motion preferences
  const animationDuration = prefersReducedMotion ? 0 : pulseDuration;
  
  // Animation variants for breathing effect
  const breathingVariants: Variants = {
    inhale: {
      scale: 1.2,
      opacity: 1,
      boxShadow: `0 0 20px ${palette.accent}80`,
    },
    exhale: {
      scale: 0.8,
      opacity: 0.7,
      boxShadow: `0 0 2px ${palette.accent}40`,
    },
    static: {
      scale: 1,
      opacity: 0.9
    }
  };
  
  // Using a cleaned set of props to avoid passing conflicting transition to Framer Motion
  const chakraProps = { ...rest };
  
  return (
    <MotionBox
      width={size}
      height={size}
      borderRadius="50%"
      bgGradient={`radial(${palette.accent}, ${palette.primary})`}
      animate={isLoading ? "inhale" : "static"}
      variants={breathingVariants}
      // Use inline transition definition
      initial={{ opacity: 0, scale: 0.9 }}
      style={{
        // Add subtle glow effect
        filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.15))'
      }}
      // Use type assertion to resolve TS issue with transition
      {...{
        transition: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: animationDuration,
          ease: "easeInOut"
        }
      } as any}
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...chakraProps}
    >
      {children}
    </MotionBox>
  );
};

export default BreathingAnimation;
// src/components/ui/RippleButton.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Define motion components
const MotionBox = motion(Box);

// Use a custom component to avoid type conflicts
const MotionButtonBase = motion(Button);
const MotionButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <MotionButtonBase ref={ref} {...props} />
));

// Define types for ripple
interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface RippleButtonProps extends Omit<ButtonProps, 'onAnimationStart' | 'transition'> {
  mood?: MoodType;
  rippleColor?: string;
  rippleOpacity?: number;
  rippleDuration?: number;
  hoverScale?: number;
  pressScale?: number;
  intensity?: 'light' | 'medium' | 'strong';
}

/**
 * A button with advanced interaction patterns including ripple effects and haptic feedback
 */
const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(({
  children,
  mood = 'focus',
  rippleColor,
  rippleOpacity = 0.4,
  rippleDuration = 0.6,
  hoverScale = 1.03,
  pressScale = 0.97,
  intensity = 'medium',
  ...rest
}, ref) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const palette = moodPalettes[mood];
  
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Define vibration patterns for different intensities
  const vibrationPatterns = {
    light: [5],
    medium: [15, 10],
    strong: [25, 15, 25]
  };
  
  // Add ripple effect at click position
  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate ripple position relative to button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create new ripple with unique ID
    const newRipple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Provide haptic feedback if available
    if (navigator.vibrate && !prefersReducedMotion) {
      navigator.vibrate(vibrationPatterns[intensity]);
    }
  };
  
  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        // Remove the oldest ripple
        setRipples(prevRipples => prevRipples.slice(1));
      }, rippleDuration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [ripples, rippleDuration]);
  
  return (
    <MotionButton
      ref={ref}
      position="relative"
      overflow="hidden"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        addRipple(e);
        if (rest.onClick) {
          rest.onClick(e);
        }
      }}
      whileHover={{ scale: prefersReducedMotion ? 1 : hoverScale }}
      whileTap={{ scale: prefersReducedMotion ? 0.98 : pressScale }}
      _focus={{ 
        boxShadow: `0 0 0 3px ${palette.accent}40`
      }}
      {...rest}
    >
      {/* Container for ripple effects */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        pointerEvents="none"
        overflow="hidden"
      >
        <AnimatePresence>
          {ripples.map(ripple => (
            <MotionBox
              key={ripple.id}
              position="absolute"
              initial={{ 
                x: ripple.x, 
                y: ripple.y, 
                scale: 0, 
                opacity: rippleOpacity 
              }}
              animate={{ 
                scale: 4, 
                opacity: 0 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: rippleDuration }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${rippleColor || palette.accent} 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </AnimatePresence>
      </Box>
      
      {/* Button content */}
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </MotionButton>
  );
});

export default RippleButton;
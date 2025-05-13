// src/components/ui/ClayButton.tsx
import React from 'react';
import { Button, Box } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';

// Create a motion-enhanced button
const MotionButton = motion(Button);

interface ClayButtonProps extends ButtonProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'strong';
  hoverScale?: number;
  pressScale?: number;
}

const ClayButton: React.FC<ClayButtonProps> = ({ 
  children, 
  intensity = 'medium',
  hoverScale = 1.05,
  pressScale = 0.95,
  colorScheme,
  onAnimationStart, // Destructure to omit from ...props
  onDragStart, // omit Chakra's onDragStart
  onDragEnd, // omit Chakra's onDragEnd 
  onDrag, // omit Chakra's onDrag
  onDragOver, // omit Chakra's onDragOver
  onDragEnter, // omit Chakra's onDragEnter
  onDragLeave, // omit Chakra's onDragLeave
  transition: _chakraTransition, // omit Chakra's transition prop
  ...props 
}) => {
  // Shadow intensity levels
  const shadowIntensity = {
    light: {
      base: '6px 6px 10px rgba(0,0,0,0.1), -4px -4px 10px rgba(255,255,255,0.05)',
      hover: '8px 8px 12px rgba(0,0,0,0.15), -6px -6px 12px rgba(255,255,255,0.08)',
      active: '4px 4px 6px rgba(0,0,0,0.2), -2px -2px 6px rgba(255,255,255,0.1)'
    },
    medium: {
      base: '8px 8px 16px rgba(0,0,0,0.2), -6px -6px 16px rgba(255,255,255,0.1)',
      hover: '10px 10px 20px rgba(0,0,0,0.25), -8px -8px 18px rgba(255,255,255,0.15)',
      active: '5px 5px 10px rgba(0,0,0,0.3), -3px -3px 10px rgba(255,255,255,0.2)'
    },
    strong: {
      base: '12px 12px 24px rgba(0,0,0,0.3), -8px -8px 24px rgba(255,255,255,0.15)',
      hover: '16px 16px 30px rgba(0,0,0,0.35), -10px -10px 30px rgba(255,255,255,0.2)',
      active: '6px 6px 12px rgba(0,0,0,0.4), -4px -4px 12px rgba(255,255,255,0.25)'
    }
  };

  // Enhanced animation variants with claymorphism effects
  const buttonVariants = {
    initial: { 
      scale: 1, 
      boxShadow: shadowIntensity[intensity].base,
      borderRadius: "16px"
    },
    hover: { 
      scale: hoverScale, 
      boxShadow: shadowIntensity[intensity].hover,
      borderRadius: "14px", // Subtle shape change on hover
    },
    tap: { 
      scale: pressScale, 
      boxShadow: shadowIntensity[intensity].active,
      borderRadius: "18px", // More rounded when pressed - "squish" effect
      // Apply a slight rotation for a more organic feel
      rotate: Math.random() > 0.5 ? 0.5 : -0.5
    }
  };

  // Create spring-based transition for more natural movement
  const springTransition: Transition = {
    type: "spring", 
    stiffness: 500, 
    damping: 30,
    mass: 1
  };

  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Simplified animation for reduced motion preference
  const accessibleTransition: Transition = prefersReducedMotion 
    ? { duration: 0.1 } 
    : springTransition;

  return (
    <MotionButton
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      transition={accessibleTransition}
      borderRadius="16px"
      fontSize="md"
      py={4}
      px={6}
      bg={props.bg || `${colorScheme}.500`}
      color={props.color || "white"}
      _hover={{ bg: props.bg || `${colorScheme}.600` }}
      position="relative"
      overflow="hidden"
      onHoverStart={() => {
        // Add subtle haptic feedback on devices that support it
        if (navigator.vibrate && !prefersReducedMotion) {
          navigator.vibrate(5);
        }
      }}
      onTap={() => {
        // Add more pronounced haptic feedback on click
        if (navigator.vibrate && !prefersReducedMotion) {
          navigator.vibrate([15, 10, 15]);
        }
      }}
      {...props}
    >
      {/* Create glass morphism effect with pseudo-element */}
      <Box 
        as="span" 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        borderRadius="inherit" 
        pointerEvents="none"
        bg="linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)"
        opacity="0.7"
        transition="opacity 0.2s ease"
        _groupHover={{ opacity: "0.9" }}
      />
      {children}
    </MotionButton>
  );
};

export default ClayButton;
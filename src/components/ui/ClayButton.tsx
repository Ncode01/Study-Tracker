// src/components/ui/ClayButton.tsx
import React from 'react';
import { Button } from '@chakra-ui/react';
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

  // Animation variants
  const buttonVariants: Record<string, { scale: number; boxShadow: string }> = {
    initial: { 
      scale: 1, 
      boxShadow: shadowIntensity[intensity].base
    },
    hover: { 
      scale: hoverScale, 
      boxShadow: shadowIntensity[intensity].hover
    },
    tap: { 
      scale: pressScale, 
      boxShadow: shadowIntensity[intensity].active
    }
  };

  return (
    <MotionButton
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      transition={{ duration: 0.2 } as Transition}
      borderRadius="16px"
      fontSize="md"
      py={4}
      px={6}
      bg={props.bg || `${colorScheme}.500`}
      color={props.color || "white"}
      _hover={{ bg: props.bg || `${colorScheme}.600` }}  // Ensure Chakra's hover also works
      position="relative"
      overflow="hidden"
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default ClayButton;
// src/components/ui/SpatialTransition.tsx
import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Motion components
const MotionBox = motion(Box);

interface SpatialTransitionProps extends BoxProps {
  isActive: boolean;
  children: React.ReactNode;
  mood?: MoodType;
  transitionType?: 'fade' | 'scale' | 'slide' | 'spatial';
  duration?: number;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
  onDrag?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDragEnter?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
}

const SpatialTransition: React.FC<SpatialTransitionProps> = ({
  isActive,
  children,
  mood = 'focus',
  transitionType = 'spatial',
  duration = 0.7,
  onAnimationStart, // omit Chakra's onAnimationStart
  transition: _chakraTransition, // omit Chakra's transition prop
  onDragStart, // omit drag-related event handlers
  onDragEnd,
  onDrag,
  onDragOver,
  onDragEnter,
  onDragLeave,
  ...rest
}) => {
  const [mounted, setMounted] = useState(false);
  const palette = moodPalettes[mood];
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Define variants for different transition types
  type VariantType = {
    initial: Record<string, any>;
    animate: Record<string, any>;
    exit: Record<string, any>;
  };

  const variants: Record<string, VariantType> = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 }
    },
    slide: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 30 }
    },
    spatial: {
      initial: { 
        opacity: 0, 
        scale: 0.95, 
        z: -100, 
        rotateX: 5,
        filter: 'blur(10px)'
      },
      animate: { 
        opacity: 1, 
        scale: 1, 
        z: 0, 
        rotateX: 0,
        filter: 'blur(0px)'
      },
      exit: { 
        opacity: 0, 
        scale: 1.02, 
        z: 50, 
        rotateX: -5,
        filter: 'blur(5px)'
      }
    }
  };

  // Set transition prop based on transitionType
  let transition: Transition | undefined = undefined;
  if (transitionType === 'fade' || transitionType === 'scale' || transitionType === 'slide') {
    transition = { duration };
  } else if (transitionType === 'spatial') {
    transition = {
      duration,
      type: 'spring',
      stiffness: 300,
      damping: 25
    };
  }

  // Apply a subtle glow effect to enhance the spatial experience
  const glowStyle = {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      background: `radial-gradient(circle at 50% 50%, ${palette.accent}20 0%, transparent 70%)`,
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.5s ease'
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {mounted && isActive && (
        <MotionBox
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants[transitionType]}
          transition={transition as Transition}
          style={{ perspective: '1200px' }}
          sx={glowStyle}
          {...rest}
        >
          {children}
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default SpatialTransition;
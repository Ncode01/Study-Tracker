// src/components/ui/GlassmorphicPanel.tsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Motion components
const MotionBox = motion(Box);

interface GlassmorphicPanelProps extends Omit<BoxProps, 'dropShadow'> {
  children: React.ReactNode;
  mood?: MoodType;
  blurStrength?: number;
  glassOpacity?: number;
  borderGlow?: boolean;
  dropShadow?: boolean;
  animateEntry?: boolean;
}

/**
 * Creates a frosted glass effect panel with mood-appropriate colors
 * Perfect for modals, overlays, and card backgrounds
 */
const GlassmorphicPanel: React.FC<GlassmorphicPanelProps> = ({
  children,
  mood = 'focus',
  blurStrength = 10,
  glassOpacity = 0.7,
  borderGlow = true,
  dropShadow = true,
  animateEntry = true,
  transition: _ignoredTransition, // Omit Chakra's transition
  ...rest
}) => {
  const palette = moodPalettes[mood];
  
  // Animation variants for glass panel entry
  const glassVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95,
      filter: 'blur(8px)'
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)'
    }
  };

  // Create the glass effect styles  
  const glassStyles = {
    position: 'relative',
    backgroundColor: `${palette.primary}20`, // Very transparent base
    backdropFilter: `blur(${blurStrength}px)`,
    borderRadius: '16px',
    border: borderGlow 
      ? `1px solid ${palette.accent}30` 
      : 'none',
    boxShadow: dropShadow 
      ? `0 8px 32px 0 ${palette.primary}30, inset 0 0 1px 0 ${palette.accent}20`
      : 'none',
    overflow: 'hidden',
    zIndex: 10,
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      background: `linear-gradient(120deg, ${palette.accent}10, ${palette.primary}10, ${palette.secondary}05)`,
      opacity: glassOpacity,
    },
    // Subtle inner highlight at the top
    _after: borderGlow ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${palette.accent}60, transparent)`,
    } : {}
  };

  return (
    <MotionBox
      initial={animateEntry ? "hidden" : "visible"}
      animate="visible"
      variants={glassVariants}
      // Use type assertion to resolve TS issue with transition
      {...{
        transition: {
          duration: 0.4,
          ease: [0.19, 1.0, 0.22, 1.0] // Ease out expo for glass-like physics
        }
      } as any}
      sx={glassStyles}
      p={5}
      {...rest}
    >
      {children}
    </MotionBox>
  );
};

export default GlassmorphicPanel;
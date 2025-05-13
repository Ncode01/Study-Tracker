// src/components/ui/AnimatedCheckmark.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

interface AnimatedCheckmarkProps {
  isChecked: boolean;
  mood?: MoodType;
  color?: string;
  strokeWidth?: number;
  size?: number;
}

/**
 * An animated SVG checkmark with dynamic color and physics-based animation
 */
const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  isChecked,
  mood = 'focus',
  color,
  strokeWidth = 2,
  size = 24
}) => {
  const palette = moodPalettes[mood];
  const checkColor = color || palette.accent;
  
  // Path for the checkmark
  const checkVariants = {
    checked: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 0.5, bounce: 0 },
        opacity: { duration: 0.15 }
      }
    },
    unchecked: {
      pathLength: 0,
      opacity: 0,
      transition: {
        pathLength: { type: "spring", duration: 0.3 },
        opacity: { duration: 0.15 }
      }
    }
  };
  
  // Circle variants for the background
  const circleVariants = {
    checked: {
      scale: 1,
      opacity: 1,
      transition: {
        scale: { type: "spring", stiffness: 300, damping: 15 },
        opacity: { duration: 0.15 }
      }
    },
    unchecked: {
      scale: 0.8,
      opacity: 0,
      transition: {
        scale: { type: "spring", stiffness: 300, damping: 15 },
        opacity: { duration: 0.15 }
      }
    }
  };
  
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      initial={false}
      animate={isChecked ? "checked" : "unchecked"}
    >
      {/* Background circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill={checkColor}
        fillOpacity="0.2"
        variants={circleVariants}
      />
      
      {/* Checkmark */}
      <motion.path
        d="M6,12 L10,16 L18,8"
        fill="transparent"
        stroke={checkColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={checkVariants}
      />
    </motion.svg>
  );
};

export default AnimatedCheckmark;
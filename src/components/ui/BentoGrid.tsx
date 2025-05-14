// src/components/ui/BentoGrid.tsx
import React from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import type { GridProps, BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Motion-enhanced components
const MotionGrid = motion(Grid) as any; // Type assertion to resolve MotionProps incompatibility
const MotionGridItem = motion(GridItem) as any;
const MotionBox = motion("div");

// Types for defining Bento box layout areas
interface BentoArea {
  id: string;
  rowSpan?: number;
  colSpan?: number;
  priority?: number; // Used for responsive stacking order
}

interface BentoGridProps extends Omit<GridProps, 'templateAreas' | 'onAnimationStart'> {
  areas: BentoArea[];
  gap?: number | string;
  children: React.ReactNode[];
  staggerAnimation?: boolean;
  mood?: MoodType;
}

interface BentoItemProps extends Omit<BoxProps, 'onAnimationStart'> {
  children: React.ReactNode;
  mood?: MoodType;
  glassmorphic?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
}

/**
 * A component that creates a modern asymmetrical "Bento Box" grid layout
 * Perfect for dashboards with different sized content areas
 */
const BentoGrid: React.FC<BentoGridProps> = ({
  areas,
  gap = 4,
  children,
  staggerAnimation = true,
  mood = 'focus',
  transition: _ignoredTransition,
  ...rest
}) => {
  // Validate that we have enough children for areas
  const validChildren = React.Children.toArray(children).filter(Boolean);
  if (validChildren.length !== areas.length) {
    console.warn(`BentoGrid: ${validChildren.length} children provided, but ${areas.length} areas defined`);
  }
  
  // Animation variants for grid items with staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerAnimation ? 0.12 : 0,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <MotionGrid
      templateColumns={{ 
        base: "repeat(1, 1fr)",
        md: "repeat(6, 1fr)",
        lg: "repeat(12, 1fr)"
      }}
      gap={gap}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...rest}
    >
      {validChildren.map((child, index) => {
        const area = areas[index];
        return (
          <MotionGridItem
            key={area.id}
            rowSpan={area.rowSpan || 1}
            colSpan={{ 
              base: 1, 
              md: Math.min(area.colSpan || 1, 6),
              lg: area.colSpan || 1
            }}
            variants={itemVariants}
            // Make grid items drag-friendly with grabber cursor
            className="draggable"
            cursor="grab"
            _active={{ cursor: "grabbing" }}
          >
            {child}
          </MotionGridItem>
        );
      })}
    </MotionGrid>
  );
};

/**
 * Individual item within a BentoGrid that can be styled independently
 */
export const BentoItem: React.FC<BentoItemProps> = ({
  children,
  mood = 'focus',
  glassmorphic = false,
  hoverEffect = 'lift',
  ...rest
}) => {
  const palette = moodPalettes[mood];
  
  // Define hover animations based on effect type
  const hoverAnimations = {
    lift: { 
      y: -10
    },
    glow: { 
      // Keep empty object to maintain the animation type without shadow
      // Filter effects would be handled separately if needed
    },
    scale: { 
      scale: 1.02 
    },
    none: {}
  };

  // Conditionally apply glassmorphism effects  
  const itemStyles = glassmorphic ? {
    bg: `${palette.primary}10`,
    backdropFilter: 'blur(8px)',
    borderWidth: '1px',
    borderColor: `${palette.accent}20`,
    borderRadius: 'xl'
  } : {
    bg: 'gray.800',
    borderRadius: 'xl',
    borderWidth: '1px',
    borderColor: 'gray.700'
  };
  
  return (
    <MotionBox
      p={4}
      h="100%"
      boxShadow="lg"
      whileHover={hoverEffect !== 'none' ? hoverAnimations[hoverEffect] : undefined}
      // Use type assertion to fix transition type issue
      {...{
        transition: { duration: 0.2 }
      } as any}
      {...itemStyles}
      {...rest}
    >
      {children}
    </MotionBox>
  );
};

export default BentoGrid;
// src/components/ui/ElasticScroll.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';

// Motion-enhanced components
const MotionBox = motion(Box) as any; // Type assertion to fix compatibility issues

interface ElasticScrollProps extends Omit<BoxProps, 'onScroll'> {
  children: React.ReactNode;
  maxHeight: string | number;
  elasticity?: number; // 0-1 range, where 1 is most elastic
  showScrollIndicator?: boolean;
  mood?: MoodType;
  scrollbarWidth?: string;
  scrollbarRadius?: string;
}

/**
 * A component that creates an elastic, physics-based scrolling container
 * with customizable scroll indicators and bounce effects
 */
const ElasticScroll: React.FC<ElasticScrollProps> = ({
  children,
  maxHeight,
  elasticity = 0.5,
  showScrollIndicator = true,
  mood = 'focus',
  scrollbarWidth = '6px',
  scrollbarRadius = '3px',
  ...rest
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const palette = moodPalettes[mood];
  
  // Motion values for scroll physics
  const scrollY = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  
  // Spring physics for elastic behavior
  const springConfig = { stiffness: 400, damping: 90, mass: 1 };
  const y = useSpring(useTransform(scrollY, [0, -contentHeight], [0, -contentHeight]), springConfig);
  
  // Check if scrolling is possible
  useEffect(() => {
    if (scrollRef.current) {
      const updateHeights = () => {
        if (scrollRef.current) {
          const content = scrollRef.current.scrollHeight;
          const container = scrollRef.current.clientHeight;
          setContentHeight(content);
          setContainerHeight(container);
          setIsScrollable(content > container);
        }
      };
      
      updateHeights();
      
      // Re-measure when window size changes
      window.addEventListener('resize', updateHeights);
      return () => window.removeEventListener('resize', updateHeights);
    }
  }, [scrollRef, children]);
  
  // Handle scroll events and apply physics
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      
      // Update motion values
      scrollY.set(-scrollTop);
      scrollYProgress.set(scrollTop / (scrollHeight - clientHeight));
      
      // Apply elastic effect at boundaries
      if (elasticity > 0) {
        if (scrollTop <= 0) {
          // Over-scroll at top
          y.set(elasticity * 100);
        } else if (scrollTop + clientHeight >= scrollHeight) {
          // Over-scroll at bottom
          y.set(-elasticity * 100);
        } else {
          y.set(0);
        }
      }
    }
  };
  
  // Create scrollbar styles as a direct style object, not through Chakra's sx prop
  const scrollbarStyleTag = showScrollIndicator ? (
    <style>
      {`
        .scrollable-content::-webkit-scrollbar {
          width: ${scrollbarWidth};
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: ${palette.primary}10;
          border-radius: ${scrollbarRadius};
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: ${palette.accent}80;
          border-radius: ${scrollbarRadius};
          transition: background 0.2s ease;
        }
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: ${palette.accent};
        }
      `}
    </style>
  ) : (
    <style>
      {`
        .scrollable-content::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}
    </style>
  );
  
  // Scroll indicator that shows scrollbar position
  const ScrollIndicator = () => {
    // Transform scrollYProgress to a position along the container height
    const indicatorTop = useTransform(
      scrollYProgress,
      [0, 1],
      [0, containerHeight - (containerHeight * (containerHeight / contentHeight))]
    );
    
    const indicatorHeight = containerHeight * (containerHeight / contentHeight);
    
    return (
      <MotionBox
        position="absolute"
        right="2px"
        width={scrollbarWidth}
        height={`${indicatorHeight}px`}
        bg={palette.accent}
        borderRadius={scrollbarRadius}
        opacity={0.8}
        style={{ top: indicatorTop }}
        // Fade out when not scrolling
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrollable ? 0.8 : 0 }}
        transition={{ duration: 0.2 }}
        // Glow on hover
        _hover={{
          bg: palette.primary,
          boxShadow: `0 0 10px ${palette.accent}50`
        }}
      />
    );
  };
  
  return (
    <Box position="relative" {...rest}>
      {scrollbarStyleTag}
      <MotionBox
        ref={scrollRef}
        maxHeight={maxHeight}
        overflowY="auto"
        position="relative"
        className="scrollable-content"
        onScroll={handleScroll}
        // Apply fluid, elastic physics to scrolling
        style={{
          y: useTransform(y, value => 
            elasticity > 0 ? Math.sin(value * 0.1) * elasticity * 20 : 0
          )
        }}
      >
        {children}
      </MotionBox>
      
      {showScrollIndicator && isScrollable && <ScrollIndicator />}
    </Box>
  );
};

export default ElasticScroll;
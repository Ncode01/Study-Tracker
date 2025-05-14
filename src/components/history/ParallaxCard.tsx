// src/components/history/ParallaxCard.tsx
import React, { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';

const MotionBox = motion(Box);

interface ParallaxCardProps extends BoxProps {
  children: React.ReactNode;
  depth?: number; // 0-1 scale, where 1 is maximum parallax effect
  direction?: 'vertical' | 'horizontal';
}

const ParallaxCard: React.FC<ParallaxCardProps> = ({ 
  children, 
  depth = 0.3, 
  direction = 'vertical',
  ...rest 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Transform scroll progress into parallax movement
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    direction === 'vertical' ? [depth * 100, -depth * 100] : [0, 0]
  );
  
  const x = useTransform(
    scrollYProgress, 
    [0, 1], 
    direction === 'horizontal' ? [depth * 100, -depth * 100] : [0, 0]
  );
  
  // Scale and opacity for enhanced depth effect
  const scale = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    [1 - depth * 0.1, 1, 1 - depth * 0.1]
  );
  
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.3, 0.7, 1], 
    [0.8, 1, 1, 0.8]
  );

  return (
    <Box ref={ref} position="relative" {...rest}>
      <MotionBox
        style={{ 
          y, 
          x,
          scale,
          opacity
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileHover={{ 
          scale: 1.05, 
          transition: { duration: 0.2 } 
        }}
      >
        {children}
      </MotionBox>
    </Box>
  );
};

export default ParallaxCard;
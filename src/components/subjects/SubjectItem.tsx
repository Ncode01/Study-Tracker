// src/components/subjects/SubjectItem.tsx
import React from 'react';
import type { Subject } from '../../types';
import { Box, Text, Flex, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface SubjectItemProps {
  subject: Subject;
  onClick?: () => void;
  isActive?: boolean;
}

const MotionBox = motion(Box);

export const SubjectItem: React.FC<SubjectItemProps> = ({ 
  subject, 
  onClick, 
  isActive = false 
}) => {
  const bgColor = 'gray.700';
  const activeBgColor = 'gray.600';
  const borderColor = 'gray.600';
  const activeBorderColor = subject.color;

  // Enhanced 3D elevation styles
  const hoverStyle = {
    transform: 'translate3d(0, -4px, 8px)',
    boxShadow: `0 12px 28px rgba(0, 0, 0, 0.2), 0 8px 10px rgba(0, 0, 0, 0.1), 0 0 0 1px ${subject.color}40`,
  };

  // Active state with more pronounced effect
  const activeStyle = {
    transform: 'translate3d(0, -2px, 5px)',
    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.15), 0 6px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px ${subject.color}60`,
  };

  // Gradient overlay for subject cards
  const gradientOverlay = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${subject.color}15 0%, rgba(0,0,0,0.1) 100%)`,
    borderRadius: 'md',
    opacity: isActive ? 1 : 0.6,
    transition: 'opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    zIndex: 0,
  };

  return (
    <MotionBox
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      p={3}
      mb={2}
      borderRadius="md"
      borderLeft="4px solid"
      borderColor={isActive ? activeBorderColor : borderColor}
      bg={isActive ? activeBgColor : bgColor}
      boxShadow={isActive ? 'md' : 'sm'}
      position="relative"
      _hover={{
        boxShadow: 'md',
        transform: 'translateY(-2px)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, ...(isActive ? activeStyle : {}) }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      whileHover={hoverStyle}
      whileTap={{ scale: 0.98 }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      sx={{
        '&:hover .gradient-overlay': {
          opacity: 0.9,
        }
      }}
    >
      <Box sx={gradientOverlay} className="gradient-overlay" />
      <Flex justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
        <Text fontWeight="medium" fontSize="clamp(1rem, 1.5vw, 1.25rem)">{subject.name}</Text>
        <Badge
          bg={subject.color}
          color={'gray.800'}
          borderRadius="full"
          px={2}
          py={1}
          fontSize="xs"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
          transition="transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)"
          _hover={{
            transform: 'scale(1.05)'
          }}
        >
          {subject.targetHours ? `${subject.targetHours}h Target` : 'No Target'}
        </Badge>
      </Flex>
    </MotionBox>
  );
};
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
      _hover={{
        boxShadow: 'md',
        transform: 'translateY(-2px)',
      }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontWeight="medium">{subject.name}</Text>
        <Badge
          bg={subject.color}
          color={'gray.800'}
          borderRadius="full"
          px={2}
          py={1}
          fontSize="xs"
        >
          {subject.targetHours ? `${subject.targetHours}h Target` : 'No Target'}
        </Badge>
      </Flex>
    </MotionBox>
  );
};
// src/components/common/PointsDisplay.tsx
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Text, HStack, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa'; // Star icon for points

const MotionText = motion(Text);

export const PointsDisplay: React.FC = () => {
  const points = useAppStore((state) => state.points);
  const textColor = 'accent.500'; // Gold color for points

  return (
    <HStack
      gap={2}
      p={3}
      bg={'gray.700'}
      borderRadius="lg"
      boxShadow="inner"
    >
      <Icon as={FaStar} color={textColor} w={6} h={6} />
      <MotionText
        fontSize="xl"
        fontWeight="bold"
        color={textColor}
        key={points} // This is important for framer-motion to re-trigger animation on change
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {points} Points
      </MotionText>
    </HStack>
  );
};
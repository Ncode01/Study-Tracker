// src/components/subjects/SubjectItem.tsx
import React from 'react';
import type { Subject } from '../../types';
import { Box, Text, Flex, Badge, Icon } from '@chakra-ui/react';
import { SmartHoverCard } from '../ui';
import { useAdaptiveTheme } from '../../styles/emotionalDesign';
import { FaClock, FaLayerGroup } from 'react-icons/fa';

interface SubjectItemProps {
  subject: Subject;
  onClick?: () => void;
  isActive?: boolean;
  tasksCount?: number;
  hoursLogged?: number;
}

export const SubjectItem: React.FC<SubjectItemProps> = ({ 
  subject, 
  onClick, 
  isActive = false,
  tasksCount = 0,
  hoursLogged = 0
}) => {
  // Get mood-based styling
  const { mood, palette } = useAdaptiveTheme();
  
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Background styles - now using glassmorphism
  const bgColor = 'rgba(30, 30, 35, 0.6)';
  const textColor = 'white';

  return (
    <SmartHoverCard
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      p={3}
      mb={3}
      borderRadius="xl"
      borderLeft="4px solid"
      borderColor={isActive ? subject.color : `${palette.accent}30`}
      bg={bgColor}
      backdropFilter="blur(8px)"
      position="relative"
      depth={0.4}
      rotateEffect={!prefersReducedMotion}
      glowEffect={true}
      glowColor={subject.color}
      scaleEffect={true}
      mood={mood}
      aria-selected={isActive}
      className={isActive ? 'active-subject' : ''}
      boxShadow={isActive ? `0 8px 20px ${subject.color}20` : 'none'}
      willChange="transform, opacity, filter"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Dynamic gradient overlay with multiple layers for depth */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={isActive ? 0.15 : 0.08}
        background={`
          radial-gradient(circle at 15% 15%, ${subject.color}80 0%, transparent 60%),
          linear-gradient(145deg, ${subject.color}30 0%, transparent 100%)
        `}
        borderRadius="inherit"
        pointerEvents="none"
        transition="opacity 0.3s"
        zIndex={0}
        _hover={{ opacity: isActive ? 0.2 : 0.12 }}
      />
      
      {/* Content container with proper z-index */}
      <Flex 
        direction="column" 
        position="relative" 
        zIndex={1}
        gap={2}
      >
        {/* Subject header with name */}
        <Flex justifyContent="space-between" alignItems="center">
          <Text 
            fontWeight="600" 
            fontSize="clamp(1rem, 1.5vw, 1.2rem)"
            color={textColor}
            letterSpacing="0.01em"
            textShadow={isActive ? `0 0 8px ${subject.color}80` : 'none'}
          >
            {subject.name}
          </Text>
          
          {/* Target hours badge */}
          <Badge
            bg={`${subject.color}30`}
            color={subject.color}
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
            display="flex"
            alignItems="center"
            boxShadow={`0 2px 8px ${subject.color}30`}
            transition="all 0.3s cubic-bezier(0.19, 1, 0.22, 1)"
            _hover={{
              transform: 'scale(1.05)'
            }}
          >
            <Icon as={FaClock} mr={1} fontSize="10px" />
            {subject.targetHours ? `${subject.targetHours}h Target` : 'No Target'}
          </Badge>
        </Flex>
        
        {/* Subject stats row */}
        {(tasksCount > 0 || hoursLogged > 0) && (
          <Flex 
            mt={1} 
            gap={3} 
            fontSize="xs" 
            color="gray.300" 
            opacity={0.8}
            alignItems="center"
          >
            {tasksCount > 0 && (
              <Flex alignItems="center">
                <Icon as={FaLayerGroup} mr={1} fontSize="10px" />
                {tasksCount} {tasksCount === 1 ? 'Task' : 'Tasks'}
              </Flex>
            )}
            
            {hoursLogged > 0 && (
              <Flex alignItems="center">
                <Icon as={FaClock} mr={1} fontSize="10px" />
                {hoursLogged} {hoursLogged === 1 ? 'Hour' : 'Hours'} Logged
              </Flex>
            )}
            
            {/* Optional progress indicator */}
            {subject.targetHours && hoursLogged > 0 && (
              <Box position="relative" flex="1" h="3px" bg="gray.700" borderRadius="full" overflow="hidden">
                <Box 
                  position="absolute"
                  top={0}
                  left={0}
                  height="100%"
                  width={`${Math.min(100, (hoursLogged / subject.targetHours) * 100)}%`}
                  bg={subject.color}
                  borderRadius="full"
                />
              </Box>
            )}
          </Flex>
        )}
      </Flex>
    </SmartHoverCard>
  );
};
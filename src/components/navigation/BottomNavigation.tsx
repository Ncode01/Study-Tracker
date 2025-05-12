// src/components/navigation/BottomNavigation.tsx
import React from 'react';
import { Box, Flex, IconButton, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHome, FaClock, FaHistory, FaUser } from 'react-icons/fa';
import { useNavStore } from '../../store/navStore';

const MotionIconButton = motion(IconButton);

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useNavStore();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { id: 'dashboard', icon: FaHome, label: 'Home' },
    { id: 'timer', icon: FaClock, label: 'Timer' },
    { id: 'history', icon: FaHistory, label: 'History' },
    { id: 'profile', icon: FaUser, label: 'Profile' },
  ] as const;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="sticky"
      borderTop="1px"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
      display={{ base: 'block', lg: 'none' }}
    >
      <Flex justify="space-around" p={1}>
        {navItems.map((item) => (
          <MotionIconButton
            key={item.id}
            aria-label={item.label}
            icon={<item.icon />}
            variant="ghost"
            borderRadius="full"
            size="lg"
            color={activeTab === item.id ? 'brand.500' : 'gray.500'}
            onClick={() => setActiveTab(item.id)}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            _hover={{ bg: 'transparent' }}
          />
        ))}
      </Flex>
    </Box>
  );
};
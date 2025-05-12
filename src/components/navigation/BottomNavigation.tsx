// src/components/navigation/BottomNavigation.tsx
import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHome, FaClock, FaHistory, FaUser } from 'react-icons/fa';
import { useNavStore } from '../../store/navStore';

interface NavItemProps {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const activeColor = 'brand.500';
  const inactiveColor = 'gray.400';
  
  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{ width: '100%' }}
    >
      <VStack
        spacing={0}
        align="center"
        justify="center"
        color={isActive ? activeColor : inactiveColor}
        cursor="pointer"
        transition="all 0.2s"
      >
        <Icon as={icon} boxSize={5} />
        <Text fontSize="xs" fontWeight={isActive ? 'bold' : 'normal'}>
          {label}
        </Text>
      </VStack>
    </motion.div>
  );
};

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useNavStore();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height="60px"
      bg={bgColor}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.15)"
      display={{ base: 'block', lg: 'none' }}
      zIndex={10}
    >
      <Flex 
        h="100%" 
        align="center" 
        justify="space-around"
        px={4}
      >
        <NavItem
          icon={FaHome}
          label="Home"
          isActive={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
        <NavItem
          icon={FaClock}
          label="Timer"
          isActive={activeTab === 'timer'}
          onClick={() => setActiveTab('timer')}
        />
        <NavItem
          icon={FaHistory}
          label="History"
          isActive={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        />
        <NavItem
          icon={FaUser}
          label="Profile"
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </Flex>
    </Box>
  );
};
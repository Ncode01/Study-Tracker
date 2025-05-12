// src/components/navigation/Sidebar.tsx
import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Divider,
  useColorModeValue,
  BoxProps,
  Button,
  Heading,
  HStack,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHome, FaClock, FaHistory, FaUser, FaChevronLeft, FaChevronRight, FaFire } from 'react-icons/fa';
import { useNavStore } from '../../store/navStore';
import { useAppStore } from '../../store/appStore';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface SidebarProps extends BoxProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, ...rest }) => {
  const { activeTab, setActiveTab } = useNavStore();
  const points = useAppStore(state => state.points);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const navItems = [
    { id: 'dashboard', icon: FaHome, label: 'Dashboard' },
    { id: 'timer', icon: FaClock, label: 'Study Timer' },
    { id: 'history', icon: FaHistory, label: 'History' },
    { id: 'profile', icon: FaUser, label: 'Profile' },
  ] as const;

  return (
    <MotionBox
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      display={{ base: 'none', lg: 'flex' }}
      flexDir="column"
      width={isCollapsed ? "80px" : "250px"}
      pt={8}
      pb={6}
      animate={{ width: isCollapsed ? "80px" : "250px" }}
      transition={{ duration: 0.2 }}
      zIndex="modal"
      {...rest}
    >
      {/* Logo and App Name */}
      <Flex px={isCollapsed ? 4 : 6} justify={isCollapsed ? "center" : "flex-start"} mb={8}>
        {isCollapsed ? (
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">✨</Text>
        ) : (
          <Heading 
            size="md" 
            bgGradient="linear(to-r, brand.400, accent.500)" 
            bgClip="text"
          >
            ✨ StudyQuest
          </Heading>
        )}
      </Flex>
      
      {/* Stats Preview (only when expanded) */}
      {!isCollapsed && (
        <Box mx={6} mb={6}>
          <HStack justify="space-between" bg="gray.700" p={3} borderRadius="md">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.400">Today's Points</Text>
              <Text fontWeight="bold" fontSize="xl">{points}</Text>
            </VStack>
            <Badge colorScheme="orange" display="flex" alignItems="center" px={2} py={1}>
              <Icon as={FaFire} mr={1} /> 3 days
            </Badge>
          </HStack>
        </Box>
      )}
      
      <Divider mb={6} />

      {/* Navigation Items */}
      <VStack flex="1" align="stretch" spacing={2}>
        {navItems.map((item) => (
          <MotionFlex
            key={item.id}
            mx={isCollapsed ? 2 : 4}
            p={3}
            borderRadius="md"
            cursor="pointer"
            onClick={() => setActiveTab(item.id)}
            bg={activeTab === item.id ? 'brand.500' : 'transparent'}
            color={activeTab === item.id ? 'white' : 'gray.500'}
            whileHover={{ backgroundColor: activeTab === item.id ? 'brand.600' : 'gray.700' }}
            whileTap={{ scale: 0.98 }}
            align="center"
          >
            <Icon as={item.icon} boxSize={5} />
            {!isCollapsed && <Text ml={4}>{item.label}</Text>}
          </MotionFlex>
        ))}
      </VStack>

      {/* Collapse/Expand Button */}
      <Tooltip label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle} 
          mt={6}
          alignSelf={isCollapsed ? "center" : "flex-end"}
          mr={isCollapsed ? 0 : 4}
        >
          <Icon as={isCollapsed ? FaChevronRight : FaChevronLeft} />
        </Button>
      </Tooltip>
    </MotionBox>
  );
};
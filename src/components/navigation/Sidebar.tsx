// src/components/navigation/Sidebar.tsx
import React from 'react';
import {
  Box,
  VStack,
  Button,
  Icon,
  Text,
  Flex,
  Tooltip,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { FaChartBar, FaTachometerAlt, FaHistory, FaUser, FaCog, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavStore } from '../../store/navStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItemProps {
  icon: any;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isCollapsed, onClick }) => {
  return (
    <Tooltip label={isCollapsed ? label : ''} placement="right" hasArrow isDisabled={!isCollapsed}>
      <Button
        variant="ghost"
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        width="100%"
        py={3}
        pl={isCollapsed ? 3 : 6}
        leftIcon={<Icon as={icon} boxSize={5} />}
        bgGradient={isActive ? 'linear(to-r, brand.500, brand.400)' : undefined}
        color={isActive ? 'white' : 'gray.400'}
        borderRadius="md"
        transition="all 0.2s"
        _hover={{ bg: isActive ? undefined : 'gray.700', color: 'white' }}
        onClick={onClick}
      >
        {!isCollapsed && <Text>{label}</Text>}
      </Button>
    </Tooltip>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { activeTab, setActiveTab } = useNavStore();
  const bgColor = 'gray.900';
  const navWidth = isCollapsed ? "80px" : "250px";
  
  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      height="100vh"
      bg={bgColor}
      width={navWidth}
      transition="width 0.2s"
      boxShadow="lg"
      zIndex="10"
      display={{ base: 'none', lg: 'block' }}
      overflow="hidden"
    >
      <VStack spacing={1} p={4} align="stretch" h="100%">
        <Flex 
          justify={isCollapsed ? 'center' : 'space-between'} 
          align="center"
          py={4}
          px={1}
          mb={4}
        >
          {!isCollapsed && (
            <Text 
              fontWeight="bold" 
              fontSize="xl"
              bgGradient="linear(to-r, brand.400, accent.500)"
              bgClip="text"
            >
              StudyQuest
            </Text>
          )}
          <Button
            variant="ghost"
            p={2}
            size="sm"
            onClick={onToggle}
          >
            <Icon as={isCollapsed ? FaChevronRight : FaChevronLeft} />
          </Button>
        </Flex>
        
        <NavItem 
          icon={FaTachometerAlt} 
          label="Dashboard"
          isActive={activeTab === 'dashboard'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab('dashboard')}
        />
        
        <NavItem 
          icon={FaChartBar} 
          label="Study Timer"
          isActive={activeTab === 'timer'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab('timer')}
        />
        
        <NavItem 
          icon={FaHistory} 
          label="History"
          isActive={activeTab === 'history'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab('history')}
        />
        
        <NavItem 
          icon={FaUser} 
          label="Profile"
          isActive={activeTab === 'profile'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab('profile')}
        />
        
        <Divider my={4} />
        
        <NavItem 
          icon={FaCog} 
          label="Settings"
          isActive={activeTab === 'settings'}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab('settings')}
        />
      </VStack>
    </Box>
  );
};
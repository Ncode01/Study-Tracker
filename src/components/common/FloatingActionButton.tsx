// src/components/common/FloatingActionButton.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  Icon,
  MenuDivider,
  Text,
  Flex
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaClipboardCheck, FaClock, FaChartBar, FaTimes } from 'react-icons/fa';
import { useNavStore } from '../../store/navStore';
import { useAdaptiveTheme } from '../../styles/emotionalDesign';
import { RippleButton } from '../ui';

const MotionBox = motion(Box);
const MotionMenuList = motion(MenuList);

interface FloatingActionButtonProps {
  onAddTask: () => void;
  onStartTimer: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onAddTask, 
  onStartTimer 
}) => {
  const { setActiveTab } = useNavStore();
  const { mood, palette } = useAdaptiveTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Animation variants for the menu
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { 
        duration: 0.2,
        ease: [0.19, 1.0, 0.22, 1.0] 
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: [0.19, 1.0, 0.22, 1.0] 
      }
    }
  };
  
  // Handle menu open/close
  const handleMenuToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
    
    // Haptic feedback when menu opens
    if (isOpen && navigator.vibrate && !prefersReducedMotion) {
      navigator.vibrate(5);
    }
  };
  
  // Handle item click with haptic feedback
  const handleItemClick = (callback: () => void) => {
    // Haptic feedback on button press
    if (navigator.vibrate && !prefersReducedMotion) {
      navigator.vibrate([15, 10]);
    }
    
    callback();
  };
  
  return (
    <MotionBox
      position="fixed"
      bottom={{ base: "70px", lg: "30px" }}
      right="30px"
      zIndex="dropdown"
    >
      <Menu
        isOpen={isOpen}
        onOpen={() => handleMenuToggle(true)}
        onClose={() => handleMenuToggle(false)}
        placement="top"
        closeOnSelect={true}
        autoSelect={false}
        strategy="fixed"
      >
        <MenuButton
          as={RippleButton}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          colorScheme="brand"
          size="lg"
          borderRadius="full"
          boxShadow={`0 4px 16px ${palette.primary}50`}
          h="60px"
          w="60px"
          mood={mood}
          rippleColor={palette.accent}
          rippleOpacity={0.7}
          hoverScale={1.06}
          pressScale={0.94}
          sx={{
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'open'}
              initial={{ rotate: isOpen ? -90 : 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: isOpen ? 0 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon as={isOpen ? FaTimes : FaPlus} fontSize="20px" />
            </motion.div>
          </AnimatePresence>
        </MenuButton>
        
        <AnimatePresence>
          {isOpen && (
            <MotionMenuList
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              bg={`rgba(26, 32, 44, 0.9)`}
              backdropFilter="blur(10px)"
              border={`1px solid ${palette.accent}30`}
              boxShadow={`0 10px 25px -5px ${palette.primary}30`}
              borderRadius="xl"
              overflow="hidden"
              minW="220px"
              py={2}
            >
              <Text fontSize="xs" fontWeight="medium" color="gray.400" textTransform="uppercase" px={3} py={2}>
                Actions
              </Text>
              
              <MenuItem 
                icon={<Icon as={FaClipboardCheck} color={palette.accent} />} 
                onClick={() => handleItemClick(onAddTask)}
                _hover={{ bg: `${palette.primary}30` }}
                transition="all 0.2s"
              >
                <Flex direction="column">
                  <Text fontWeight="500">Add New Task</Text>
                  <Text fontSize="xs" color="gray.400">Create a task to track</Text>
                </Flex>
              </MenuItem>
              
              <MenuItem 
                icon={<Icon as={FaClock} color={palette.accent} />} 
                onClick={() => handleItemClick(() => {
                  setActiveTab('timer');
                  onStartTimer();
                })}
                _hover={{ bg: `${palette.primary}30` }}
                transition="all 0.2s"
              >
                <Flex direction="column">
                  <Text fontWeight="500">Start Study Session</Text>
                  <Text fontSize="xs" color="gray.400">Begin focused study time</Text>
                </Flex>
              </MenuItem>
              
              <MenuDivider />
              
              <MenuItem 
                icon={<Icon as={FaChartBar} color={palette.accent} />} 
                onClick={() => handleItemClick(() => setActiveTab('history'))}
                _hover={{ bg: `${palette.primary}30` }}
                transition="all 0.2s"
              >
                <Flex direction="column">
                  <Text fontWeight="500">View History</Text>
                  <Text fontSize="xs" color="gray.400">Check your progress</Text>
                </Flex>
              </MenuItem>
            </MotionMenuList>
          )}
        </AnimatePresence>
      </Menu>
    </MotionBox>
  );
};
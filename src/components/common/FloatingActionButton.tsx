// src/components/common/FloatingActionButton.tsx
import React from 'react';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  Icon
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlus, FaClipboardCheck, FaClock } from 'react-icons/fa';
import { useNavStore } from '../../store/navStore';

const MotionBox = motion(Box);

interface FloatingActionButtonProps {
  onAddTask: () => void;
  onStartTimer: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onAddTask, 
  onStartTimer 
}) => {
  const { setActiveTab } = useNavStore();
  
  return (
    <MotionBox
      position="fixed"
      bottom={{ base: "70px", lg: "30px" }}
      right="30px"
      zIndex="dropdown"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Add new"
          icon={<FaPlus />}
          colorScheme="brand"
          size="lg"
          borderRadius="full"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          h="60px"
          w="60px"
          fontSize="20px"
        />
        <MenuList zIndex="dropdown">
          <MenuItem 
            icon={<Icon as={FaClipboardCheck} />} 
            onClick={onAddTask}
          >
            Add New Task
          </MenuItem>
          <MenuItem 
            icon={<Icon as={FaClock} />} 
            onClick={() => {
              setActiveTab('timer');
              onStartTimer();
            }}
          >
            Start Study Session
          </MenuItem>
        </MenuList>
      </Menu>
    </MotionBox>
  );
};
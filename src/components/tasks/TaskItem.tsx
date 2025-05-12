// src/components/tasks/TaskItem.tsx
import React from 'react';
import type { Task } from '../../types';
import { useAppStore } from '../../store/appStore';
import { Box, Text, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaFire } from 'react-icons/fa';

interface TaskItemProps {
  task: Task;
}

// Custom Checkbox and Tag components since Chakra UI v3 has different component exports
const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <Box 
    as="button"
    onClick={onChange}
    w="20px" 
    h="20px" 
    borderWidth="2px"
    borderColor={checked ? 'accent.500' : 'gray.400'}
    borderRadius="md"
    bg={checked ? 'accent.500' : 'transparent'}
    display="flex"
    alignItems="center"
    justifyContent="center"
    transition="all 0.2s"
    _hover={{ 
      borderColor: checked ? 'yellow.400' : 'gray.500',
      bg: checked ? 'yellow.400' : 'transparent'
    }}
  >
    {checked && <Box as="span" fontSize="12px" color="white">✓</Box>}
  </Box>
);

const CustomTag = ({ children, colorScheme }: { children: React.ReactNode; colorScheme: string }) => (
  <Box
    px={2}
    py={1}
    borderRadius="full"
    fontSize="xs"
    fontWeight="bold"
    bg={colorScheme === 'green' ? 'green.500' : 'blue.500'}
    color="white"
  >
    {children}
  </Box>
);

const MotionBox = motion(Box);

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask } = useAppStore();
  const bgColor = 'gray.700';
  const borderColor = 'gray.600';
  const completedColor = 'gray.500';

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
    completed: { opacity: 0.6, textDecoration: 'line-through' }
  };

  return (
    <MotionBox
      layout
      variants={itemVariants}
      initial="hidden"
      animate={task.completed ? ["visible", "completed"] : "visible"}
      exit="exit"
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      mb={3}
      boxShadow="md"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack gap={4}>
        <CustomCheckbox
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
        />
        <Box>
          <Text fontWeight="medium" color={task.completed ? completedColor : undefined}>
            {task.description}
          </Text>
          {task.dueDate && (
            <Text fontSize="sm" color={task.completed ? completedColor : "gray.500"}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
        </Box>
      </HStack>
      <HStack gap={2}>
        {task.priority === 'high' && <FaFire color="orange" title="High Priority"/>}
        <CustomTag colorScheme={task.completed ? "green" : "blue"}>
          {task.completed ? "Done!" : "Pending"}
        </CustomTag>
      </HStack>
    </MotionBox>
  );
};
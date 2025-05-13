// src/components/tasks/TaskList.tsx
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from './TaskItem';
import { VStack, Text, Box, Spinner, Center } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';

interface TaskListProps {
  subjectId?: string; // Optionally filter tasks by subject
}

export const TaskList: React.FC<TaskListProps> = ({ subjectId }) => {
  const tasks = useAppStore((state) =>
    subjectId ? state.tasks.filter(task => task.subjectId === subjectId) : state.tasks
  );
  
  const isAuthenticated = useAppStore(state => state.auth.isAuthenticated);
  const isSyncing = useAppStore(state => state.isSyncing);

  // Debug logging to verify tasks are loaded
  useEffect(() => {
    console.log("TaskList rendered with tasks:", tasks);
    console.log("Filtering by subjectId:", subjectId);
  }, [tasks, subjectId]);

  // Sort tasks: incomplete first, then by creation date or due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Add more sorting logic if needed (e.g., by due date)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Show loading spinner while syncing
  if (isSyncing) {
    return (
      <Center py={10}>
        <Spinner size="md" color="blue.400" />
      </Center>
    );
  }

  // If no tasks, show a helpful message
  if (sortedTasks.length === 0) {
    return (
      <Box 
        mt={4} 
        p={6} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor="gray.700"
        bg="rgba(45, 55, 72, 0.3)"
        backdropFilter="blur(8px)"
      >
        <Text color="gray.400" textAlign="center">
          {isAuthenticated 
            ? "No tasks yet. Add some to get started! ✨" 
            : "Please log in to view your tasks."}
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={3} align="stretch" w="100%" py={2}>
      <AnimatePresence>
        {sortedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </VStack>
  );
};
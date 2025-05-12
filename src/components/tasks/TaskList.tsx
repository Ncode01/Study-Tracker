// src/components/tasks/TaskList.tsx
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from './TaskItem';
import { VStack, Text } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';

interface TaskListProps {
  subjectId?: string; // Optionally filter tasks by subject
}

export const TaskList: React.FC<TaskListProps> = ({ subjectId }) => {
  const tasks = useAppStore((state) =>
    subjectId ? state.tasks.filter(task => task.subjectId === subjectId) : state.tasks
  );

  // Sort tasks: incomplete first, then by creation date or due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Add more sorting logic if needed (e.g., by due date)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (sortedTasks.length === 0) {
    return <Text mt={4} color="gray.500">No tasks yet. Add some to get started! ✨</Text>;
  }

  return (
    <VStack gap={0} align="stretch" w="100%">
      <AnimatePresence>
        {sortedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </VStack>
  );
};
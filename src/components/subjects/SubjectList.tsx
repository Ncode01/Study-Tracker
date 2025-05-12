// src/components/subjects/SubjectList.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { SubjectItem } from './SubjectItem';
import { VStack, Text, Box } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';

interface SubjectListProps {
  onSelectSubject?: (subjectId: string | null) => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({ onSelectSubject }) => {
  const subjects = useAppStore(state => state.subjects);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const handleSubjectClick = (subjectId: string) => {
    // Toggle selection if clicking the already active subject
    const newActiveId = activeSubjectId === subjectId ? null : subjectId;
    setActiveSubjectId(newActiveId);
    
    if (onSelectSubject) {
      onSelectSubject(newActiveId);
    }
  };

  if (subjects.length === 0) {
    return <Text mt={4} color="gray.500">No subjects yet. Add a subject to get started! 📚</Text>;
  }

  return (
    <Box mt={4}>
      <AnimatePresence>
        <VStack gap={2} align="stretch">
          {subjects.map(subject => (
            <SubjectItem
              key={subject.id}
              subject={subject}
              isActive={subject.id === activeSubjectId}
              onClick={() => handleSubjectClick(subject.id)}
            />
          ))}
        </VStack>
      </AnimatePresence>
    </Box>
  );
};
// src/components/subjects/SubjectForm.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  Box,
  Button,
  Text,
  Input,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes } from 'react-icons/fa';

const MotionBox = motion(Box);

// Predefined color options for subjects
const SUBJECT_COLORS = [
  '#FF5252', // Red
  '#FF9800', // Orange
  '#FFEB3B', // Yellow
  '#66BB6A', // Green
  '#42A5F5', // Blue
  '#AB47BC', // Purple
  '#EC407A', // Pink
  '#26A69A', // Teal
];

export const SubjectForm: React.FC = () => {
  const { addSubject } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [subjectData, setSubjectData] = useState({
    name: '',
    color: SUBJECT_COLORS[0],
    targetHours: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setSubjectData(prev => ({ ...prev, color }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectData.name.trim()) return;

    addSubject({
      name: subjectData.name,
      color: subjectData.color,
      targetHours: subjectData.targetHours > 0 ? subjectData.targetHours : undefined
    });

    // Reset form
    setSubjectData({
      name: '',
      color: SUBJECT_COLORS[0],
      targetHours: 0
    });
    setIsOpen(false);
  };

  const formBackground = 'gray.700';
  const buttonColorScheme = 'brand';

  return (
    <Box mb={6}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="md"
          variant="solid"
          w="100%"
          boxShadow="md"
          _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          transition="all 0.2s"
        >
          <FaPlus style={{ marginRight: '8px' }} />
          Add New Subject
        </Button>
      ) : (
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          p={5}
          borderRadius="lg"
          boxShadow="md"
          bg={formBackground}
        >
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Add New Subject</Text>
                <Button
                  aria-label="Close form"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <FaTimes />
                </Button>
              </HStack>

              <Box>
                <Text mb={1} fontWeight="medium">Subject Name</Text>
                <Input
                  name="name"
                  value={subjectData.name}
                  onChange={handleChange}
                  placeholder="E.g., Mathematics, Physics, Programming..."
                  required
                />
              </Box>
              
              <Box>
                <Text mb={1} fontWeight="medium">Color</Text>
                <HStack gap={2} flexWrap="wrap">
                  {SUBJECT_COLORS.map(color => (
                    <Box
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      bg={color}
                      w="30px"
                      h="30px"
                      borderRadius="md"
                      cursor="pointer"
                      boxShadow={subjectData.color === color ? 'outline' : 'none'}
                      _hover={{ transform: 'scale(1.1)' }}
                      transition="all 0.2s"
                    />
                  ))}
                </HStack>
              </Box>
              
              <Box>
                <Text mb={1} fontWeight="medium">Target Hours (Optional)</Text>
                <Input 
                  type="number"
                  name="targetHours"
                  min={0}
                  max={100}
                  value={subjectData.targetHours}
                  onChange={(e) => setSubjectData(prev => ({ ...prev, targetHours: parseInt(e.target.value) || 0 }))}
                />
              </Box>
              
              <Button 
                mt={2}
                colorScheme={buttonColorScheme}
                type="submit"
                disabled={!subjectData.name.trim()}
              >
                Add Subject
              </Button>
            </VStack>
          </form>
        </MotionBox>
      )}
    </Box>
  );
};
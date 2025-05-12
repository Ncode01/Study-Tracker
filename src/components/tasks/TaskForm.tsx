// src/components/tasks/TaskForm.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  Box,
  Button,
  Text,
  Input,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { CustomSelect } from '../common/CustomSelect';

const MotionBox = motion(Box);

interface TaskFormProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen: isOpenProp = false, onClose }) => {
  const { addTask, subjects } = useAppStore();
  const [isLocalOpen, setIsLocalOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    description: '',
    subjectId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  // Determine if we're using local state or props for controlling open state
  const isControlled = onClose !== undefined;
  const isOpen = isControlled ? isOpenProp : isLocalOpen;

  const handleToggle = () => {
    if (isControlled) {
      if (onClose) onClose();
    } else {
      setIsLocalOpen(!isLocalOpen);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.description.trim() || !taskData.subjectId) return;

    addTask({
      description: taskData.description,
      subjectId: taskData.subjectId,
      priority: taskData.priority,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
    });

    // Reset form
    setTaskData({
      description: '',
      subjectId: '',
      priority: 'medium',
      dueDate: ''
    });
    
    // Close form
    handleToggle();
  };

  const formBackground = useColorModeValue('white', 'gray.700');
  const buttonColorScheme = 'brand';

  // If using inline form (old behavior)
  if (!isControlled) {
    return (
      <Box mb={6}>
        {!isLocalOpen ? (
          <Button
            onClick={() => setIsLocalOpen(true)}
            size="md"
            variant="solid"
            w="100%"
            boxShadow="md"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <FaPlus style={{ marginRight: '8px' }} />
            Add New Task
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
                  <Text fontWeight="bold">Add New Task</Text>
                  <Button
                    aria-label="Close form"
                    size="sm"
                    variant="ghost"
                    onClick={handleToggle}
                  >
                    <FaTimes />
                  </Button>
                </HStack>

                <Box>
                  <Text mb={1} fontWeight="medium">Description</Text>
                  <Input
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                    placeholder="What needs to be done?"
                    required
                  />
                </Box>
                
                <Box>
                  <Text mb={1} fontWeight="medium">Subject</Text>
                  <CustomSelect 
                    name="subjectId" 
                    value={taskData.subjectId} 
                    onChange={handleChange}
                    placeholder="Select a subject"
                    required
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </CustomSelect>
                </Box>
                
                <HStack>
                  <Box width="50%">
                    <Text mb={1} fontWeight="medium">Priority</Text>
                    <CustomSelect name="priority" value={taskData.priority} onChange={handleChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </CustomSelect>
                  </Box>
                  
                  <Box width="50%">
                    <Text mb={1} fontWeight="medium">Due Date</Text>
                    <Input
                      name="dueDate"
                      type="date"
                      value={taskData.dueDate}
                      onChange={handleChange}
                    />
                  </Box>
                </HStack>
                
                <Button 
                  mt={2}
                  colorScheme={buttonColorScheme}
                  type="submit"
                  disabled={!taskData.description.trim() || !taskData.subjectId}
                >
                  Add Task
                </Button>
              </VStack>
            </form>
          </MotionBox>
        )}
      </Box>
    );
  }

  // If using modal (new behavior)
  return (
    <Modal isOpen={isOpen} onClose={handleToggle} isCentered>
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent bg={formBackground}>
        <ModalHeader>Add New Task</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack gap={4} align="stretch">
              <Box>
                <Text mb={1} fontWeight="medium">Description</Text>
                <Input
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  required
                />
              </Box>
              
              <Box>
                <Text mb={1} fontWeight="medium">Subject</Text>
                <CustomSelect 
                  name="subjectId" 
                  value={taskData.subjectId} 
                  onChange={handleChange}
                  placeholder="Select a subject"
                  required
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </CustomSelect>
              </Box>
              
              <HStack>
                <Box width="50%">
                  <Text mb={1} fontWeight="medium">Priority</Text>
                  <CustomSelect name="priority" value={taskData.priority} onChange={handleChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </CustomSelect>
                </Box>
                
                <Box width="50%">
                  <Text mb={1} fontWeight="medium">Due Date</Text>
                  <Input
                    name="dueDate"
                    type="date"
                    value={taskData.dueDate}
                    onChange={handleChange}
                  />
                </Box>
              </HStack>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={handleToggle}>
              Cancel
            </Button>
            <Button 
              colorScheme={buttonColorScheme}
              type="submit"
              disabled={!taskData.description.trim() || !taskData.subjectId}
            >
              Add Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
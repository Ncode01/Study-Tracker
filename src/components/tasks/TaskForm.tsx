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
import { useFormHandler } from '../../hooks/useFormHandler';

const MotionBox = motion(Box);

interface TaskFormProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen: isOpenProp = false, onClose }) => {
  const { addTask, subjects } = useAppStore();
  const [isLocalOpen, setIsLocalOpen] = useState(false);

  const { formData, handleChange, handleSubmit, resetForm } = useFormHandler({
    initialValues: {
      description: '',
      subjectId: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      dueDate: ''
    },
    onSubmit: (data) => {
      addTask({
        description: data.description,
        subjectId: data.subjectId,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      });
      resetForm();
      handleToggle();
    }
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
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What needs to be done?"
                    required
                  />
                </Box>
                
                <Box>
                  <Text mb={1} fontWeight="medium">Subject</Text>
                  <CustomSelect 
                    name="subjectId" 
                    value={formData.subjectId} 
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
                    <CustomSelect name="priority" value={formData.priority} onChange={handleChange}>
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
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </Box>
                </HStack>
                
                <Button 
                  mt={2}
                  colorScheme={buttonColorScheme}
                  type="submit"
                  disabled={!formData.description.trim() || !formData.subjectId}
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
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  required
                />
              </Box>
              
              <Box>
                <Text mb={1} fontWeight="medium">Subject</Text>
                <CustomSelect 
                  name="subjectId" 
                  value={formData.subjectId} 
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
                  <CustomSelect name="priority" value={formData.priority} onChange={handleChange}>
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
                    value={formData.dueDate}
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
              disabled={!formData.description.trim() || !formData.subjectId}
            >
              Add Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

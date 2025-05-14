import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  HStack,
  useToast,
  RadioGroup,
  Radio
} from '@chakra-ui/react';
import { useCalendarStore } from '../../store/calendarStore';
import { format } from 'date-fns';
import type { Subject, CalendarReminder } from '../../types';

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialDate: Date;
  reminderToEdit?: CalendarReminder;
}

const ReminderFormModal: React.FC<ReminderFormModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialDate,
  reminderToEdit
}) => {
  const toast = useToast();
  const { addReminder, updateReminder } = useCalendarStore();
  
  // Initial form values
  const [formValues, setFormValues] = useState<Partial<CalendarReminder>>(
    reminderToEdit || {
      title: '',
      date: initialDate,
      time: '09:00',
      description: '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      completed: false, // Use 'completed' instead of 'isCompleted'
      priority: 'medium'
    }
  );
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setFormValues(prev => ({
      ...prev,
      date
    }));
  };
  
  // Handle priority change
  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    setFormValues(prev => ({
      ...prev,
      priority
    }));
  };
  
  // Get color based on priority
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#dc3545'; // Red
      case 'medium':
        return '#fd7e14'; // Orange
      case 'low':
        return '#28a745'; // Green
      default:
        return '#fd7e14'; // Default to medium (orange)
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!formValues.title || !formValues.date) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide at least a title and date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      if (reminderToEdit) {
        // Update existing reminder
        await updateReminder({
          ...reminderToEdit,
          ...formValues
        } as CalendarReminder);
        
        toast({
          title: 'Reminder updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new reminder
        await addReminder(formValues as Omit<CalendarReminder, 'id'>);
        
        toast({
          title: 'Reminder added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving reminder',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {reminderToEdit ? 'Edit Reminder' : 'Add New Reminder'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Reminder Title</FormLabel>
            <Input 
              name="title" 
              value={formValues.title || ''} 
              onChange={handleChange} 
              placeholder="e.g. Submit Assignment"
            />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Subject (optional)</FormLabel>
            <Select 
              name="subjectId" 
              value={formValues.subjectId || ''} 
              onChange={handleChange}
            >
              <option value="">None</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <HStack mb={4} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input 
                name="date" 
                type="date" 
                value={formValues.date ? format(new Date(formValues.date), 'yyyy-MM-dd') : ''} 
                onChange={handleDateChange}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Time (optional)</FormLabel>
              <Input 
                name="time" 
                type="time" 
                value={formValues.time || ''} 
                onChange={handleChange}
              />
              <FormHelperText>Leave empty for all-day reminders</FormHelperText>
            </FormControl>
          </HStack>
          
          <FormControl mb={4}>
            <FormLabel>Description (optional)</FormLabel>
            <Input 
              as="textarea"
              name="description" 
              value={formValues.description || ''} 
              onChange={handleChange} 
              placeholder="Additional details"
              rows={3}
            />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Priority</FormLabel>
            <RadioGroup 
              value={formValues.priority || 'medium'} 
              onChange={val => handlePriorityChange(val as 'low' | 'medium' | 'high')}
            >
              <HStack spacing={4}>
                <Radio 
                  value="low" 
                  borderColor={getPriorityColor('low')}
                  _checked={{ 
                    bg: getPriorityColor('low'),
                    borderColor: getPriorityColor('low')
                  }}
                >
                  Low
                </Radio>
                <Radio 
                  value="medium"
                  borderColor={getPriorityColor('medium')}
                  _checked={{ 
                    bg: getPriorityColor('medium'),
                    borderColor: getPriorityColor('medium')
                  }}
                >
                  Medium
                </Radio>
                <Radio 
                  value="high"
                  borderColor={getPriorityColor('high')}
                  _checked={{ 
                    bg: getPriorityColor('high'),
                    borderColor: getPriorityColor('high')
                  }}
                >
                  High
                </Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {reminderToEdit ? 'Update' : 'Add'} Reminder
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReminderFormModal;
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
  Input,
  Select,
  Checkbox,
  Stack,
  HStack,
  useToast,
  FormHelperText
} from '@chakra-ui/react';
import { useCalendarStore } from '../../store/calendarStore';
import { format } from 'date-fns';
import type { Subject, CalendarClass } from '../../types';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialDate: Date;
  classToEdit?: CalendarClass;
}

const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialDate,
  classToEdit
}) => {
  const toast = useToast();
  const { addClass, updateClass } = useCalendarStore();
  
  // Initial form values
  const [formValues, setFormValues] = useState<Partial<CalendarClass>>(
    classToEdit || {
      title: '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      location: '',
      startTime: '09:00',
      endTime: '10:00',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday by default
      startRecur: initialDate,
      endRecur: undefined,
      notes: '',
      color: subjects.length > 0 ? subjects[0].color : '#3182CE'
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
  
  // Handle subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    const subject = subjects.find(s => s.id === subjectId);
    
    setFormValues(prev => ({
      ...prev,
      subjectId,
      color: subject?.color || '#3182CE'
    }));
  };
  
  // Handle day of week checkbox change
  const handleDayChange = (day: number) => {
    setFormValues(prev => {
      const currentDays = prev.daysOfWeek || [];
      if (currentDays.includes(day)) {
        return {
          ...prev,
          daysOfWeek: currentDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          daysOfWeek: [...currentDays, day].sort()
        };
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!formValues.title || !formValues.startTime || !formValues.endTime || 
        !formValues.daysOfWeek || formValues.daysOfWeek.length === 0) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide at least a title, start/end times, and selected days',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      if (classToEdit) {
        // Update existing class
        await updateClass({
          ...classToEdit,
          ...formValues
        } as CalendarClass);
        
        toast({
          title: 'Class schedule updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new class
        await addClass(formValues as Omit<CalendarClass, 'id'>);
        
        toast({
          title: 'Class schedule added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving class',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {classToEdit ? 'Edit Class Schedule' : 'Add New Class Schedule'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Class Title</FormLabel>
            <Input 
              name="title" 
              value={formValues.title || ''} 
              onChange={handleChange} 
              placeholder="e.g. Calculus 101"
            />
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Subject</FormLabel>
            <Select 
              name="subjectId" 
              value={formValues.subjectId || ''} 
              onChange={handleSubjectChange}
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl mb={4}>
            <FormLabel>Location (optional)</FormLabel>
            <Input 
              name="location" 
              value={formValues.location || ''} 
              onChange={handleChange} 
              placeholder="e.g. Room 301"
            />
          </FormControl>
          
          <HStack mb={4} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Start Time</FormLabel>
              <Input 
                name="startTime" 
                type="time" 
                value={formValues.startTime || ''} 
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>End Time</FormLabel>
              <Input 
                name="endTime" 
                type="time" 
                value={formValues.endTime || ''} 
                onChange={handleChange}
              />
            </FormControl>
          </HStack>
          
          <FormControl isRequired mb={4}>
            <FormLabel>Repeat on Days</FormLabel>
            <Stack spacing={1}>
              {daysOfWeek.map(day => (
                <Checkbox 
                  key={day.value}
                  isChecked={(formValues.daysOfWeek || []).includes(day.value)}
                  onChange={() => handleDayChange(day.value)}
                >
                  {day.label}
                </Checkbox>
              ))}
            </Stack>
          </FormControl>
          
          <HStack mb={4} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Start Date</FormLabel>
              <Input 
                name="startRecur" 
                type="date" 
                value={formValues.startRecur ? format(new Date(formValues.startRecur), 'yyyy-MM-dd') : ''} 
                onChange={(e) => {
                  setFormValues(prev => ({
                    ...prev,
                    startRecur: new Date(e.target.value)
                  }));
                }}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>End Date (optional)</FormLabel>
              <Input 
                name="endRecur" 
                type="date" 
                value={formValues.endRecur ? format(new Date(formValues.endRecur), 'yyyy-MM-dd') : ''} 
                onChange={(e) => {
                  setFormValues(prev => ({
                    ...prev,
                    endRecur: e.target.value ? new Date(e.target.value) : undefined
                  }));
                }}
              />
              <FormHelperText>Leave empty if ongoing</FormHelperText>
            </FormControl>
          </HStack>
          
          <FormControl mb={4}>
            <FormLabel>Notes (optional)</FormLabel>
            <Input 
              name="notes" 
              value={formValues.notes || ''} 
              onChange={handleChange} 
              placeholder="Any additional details"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {classToEdit ? 'Update' : 'Add'} Class
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClassFormModal;

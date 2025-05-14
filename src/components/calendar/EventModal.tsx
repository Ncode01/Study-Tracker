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
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch
} from '@chakra-ui/react';
import { useCalendarStore } from '../../store/calendarStore';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaClock, FaMapMarkerAlt, FaBook, FaStickyNote } from 'react-icons/fa';
import type { CalendarEvent, Subject } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
  subjects: Subject[];
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  subjects
}) => {
  const toast = useToast();
  const { updateEvent, deleteEvent } = useCalendarStore();
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // Form values for editing
  const [formValues, setFormValues] = useState<Partial<CalendarEvent>>({
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    allDay: event.allDay || false
  });
  
  // Check if the event can be edited
  const canEdit = event.editable !== false;
  
  // Get subject details
  const eventSubject = subjects.find(s => s.id === event.subjectId);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle all day switch change
  const handleAllDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      allDay: e.target.checked
    }));
  };
  
  // Handle form submission to update event
  const handleUpdateEvent = async () => {
    try {
      const updatedEvent: CalendarEvent = {
        ...event,
        ...formValues
      };
      
      await updateEvent(updatedEvent);
      
      toast({
        title: 'Event updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error updating event',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(event.id);
      
      toast({
        title: 'Event deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Error deleting event',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsDeleteConfirmOpen(false);
    }
  };
  
  // Format date and time for display
  const formatDateTime = (date: Date, includeTime: boolean = true) => {
    if (includeTime) {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    }
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Format event type for display
  const getEventTypeDisplay = () => {
    if (event.source === 'study-session') {
      return <Badge colorScheme="purple">Study Session</Badge>;
    }
    
    if (event.reminderId) {
      return <Badge colorScheme="green">Reminder</Badge>;
    }
    
    if (event.classId) {
      return <Badge colorScheme="blue">Class</Badge>;
    }
    
    return <Badge colorScheme="gray">Event</Badge>;
  };
  
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            backgroundColor={event.backgroundColor || eventSubject?.color}
            color={event.textColor || 'white'}
            borderTopRadius="md"
          >
            {isEditing ? 'Edit Event' : 'Event Details'}
            <HStack>
              {canEdit && !isEditing && (
                <IconButton
                  aria-label="Edit event"
                  icon={<FaEdit />}
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                />
              )}
              {canEdit && (
                <IconButton
                  aria-label="Delete event"
                  icon={<FaTrash />}
                  size="sm"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                />
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={event.textColor || 'white'} />
          
          <ModalBody>
            {isEditing ? (
              // Edit form
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input 
                    name="title" 
                    value={formValues.title || ''} 
                    onChange={handleChange}
                  />
                </FormControl>
                
                {event.source !== 'study-session' && (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="allDay" mb="0">
                      All day event
                    </FormLabel>
                    <Switch 
                      id="allDay" 
                      isChecked={formValues.allDay} 
                      onChange={handleAllDayChange}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Location (optional)</FormLabel>
                  <Input 
                    name="location" 
                    value={formValues.location || ''} 
                    onChange={handleChange}
                    placeholder="e.g. Room 101, Library"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description (optional)</FormLabel>
                  <Textarea 
                    name="description" 
                    value={formValues.description || ''} 
                    onChange={handleChange}
                    placeholder="Enter event details"
                    rows={4}
                  />
                </FormControl>
              </VStack>
            ) : (
              // View details
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="xl" fontWeight="bold">
                    {event.title}
                  </Text>
                  <HStack mt={1}>
                    {getEventTypeDisplay()}
                    {eventSubject && (
                      <Badge 
                        colorScheme="gray" 
                        backgroundColor={eventSubject.color}
                        color="white"
                      >
                        {eventSubject.name}
                      </Badge>
                    )}
                  </HStack>
                </Box>
                
                <Divider />
                
                <HStack>
                  <FaClock />
                  <Box>
                    <Text fontWeight="medium">
                      {event.allDay 
                        ? formatDateTime(event.start, false)
                        : formatDateTime(event.start)}
                    </Text>
                    {event.end && !event.allDay && (
                      <Text>
                        to {formatDateTime(event.end)}
                      </Text>
                    )}
                    {event.allDay && <Badge colorScheme="blue">All day</Badge>}
                  </Box>
                </HStack>
                
                {event.location && (
                  <HStack>
                    <FaMapMarkerAlt />
                    <Text>{event.location}</Text>
                  </HStack>
                )}
                
                {event.description && (
                  <Box>
                    <HStack mb={1}>
                      <FaStickyNote />
                      <Text fontWeight="medium">Notes</Text>
                    </HStack>
                    <Text ml={6}>{event.description}</Text>
                  </Box>
                )}
                
                {/* If this is a class event, show recurrence info */}
                {event.classId && event.isRecurring && (
                  <Box>
                    <HStack mb={1}>
                      <FaBook />
                      <Text fontWeight="medium">Recurring class</Text>
                    </HStack>
                  </Box>
                )}
                
                {/* If this is a study session, show additional details */}
                {event.source === 'study-session' && (
                  <Box>
                    <Text fontWeight="medium">
                      Study session duration: {Math.round(
                        (new Date(event.end).getTime() - new Date(event.start).getTime()) / (60 * 1000)
                      )} minutes
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} mr={3}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleUpdateEvent}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isDeleteConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteEvent} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default EventModal;
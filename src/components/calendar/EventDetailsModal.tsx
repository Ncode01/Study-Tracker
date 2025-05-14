import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,  Badge,
  Box,
  Flex,
  VStack,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaBook, FaTags } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAppStore } from '../../store/appStore';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const subjects = useAppStore(state => state.subjects);

  if (!event) return null;

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'Not assigned';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown subject';
  };

  const getEventTypeBadge = () => {
    switch(event.type) {
      case 'class':
        return <Badge colorScheme="blue">Class</Badge>;
      case 'reminder':
        return <Badge colorScheme="orange">Reminder</Badge>;
      default:
        return <Badge colorScheme="green">Event</Badge>;
    }
  };
  const formatDate = (date: Date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  const formatTime = (date: Date) => {
    if (!date) return '';
    return format(new Date(date), 'h:mm a');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Text>{event.title}</Text>
            {getEventTypeBadge()}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* Date and Time */}
            <Box>
              <HStack>
                <Icon as={FaCalendarAlt} color="brand.500" />
                <Text fontWeight="bold">Date:</Text>
              </HStack>
              <Text ml={6} color={textColor}>
                {event.start ? formatDate(event.start) : 'N/A'}
                {event.end && event.start?.toDateString() !== event.end?.toDateString() && 
                  ` - ${formatDate(event.end)}`}
              </Text>
            </Box>

            {/* Time */}
            {event.start && !event.allDay && (
              <Box>
                <HStack>
                  <Icon as={FaClock} color="brand.500" />
                  <Text fontWeight="bold">Time:</Text>
                </HStack>
                <Text ml={6} color={textColor}>
                  {formatTime(event.start)}
                  {event.end && ` - ${formatTime(event.end)}`}
                  {event.type === 'class' && event.data?.daysOfWeek && (
                    <Box mt={1}>
                      <Text fontWeight="bold" fontSize="sm">Repeats on:</Text>
                      <Text fontSize="sm">
                        {event.data.daysOfWeek.map((day: number) => {
                          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          return days[day];
                        }).join(', ')}
                      </Text>
                    </Box>
                  )}
                </Text>
              </Box>
            )}

            {/* Location */}
            {event.data?.location && (
              <Box>
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="brand.500" />
                  <Text fontWeight="bold">Location:</Text>
                </HStack>
                <Text ml={6} color={textColor}>{event.data.location}</Text>
              </Box>
            )}            {/* Subject */}
            {event.data?.subjectId && (
              <Box>
                <HStack>
                  <Icon as={FaBook} color="brand.500" />
                  <Text fontWeight="bold">Subject:</Text>
                </HStack>
                <Text ml={6} color={textColor}>{getSubjectName(event.data.subjectId)}</Text>
              </Box>
            )}

            {/* Notes/Description */}
            {(event.data?.notes || event.data?.description) && (
              <Box>
                <HStack>
                  <Icon as={FaTags} color="brand.500" />
                  <Text fontWeight="bold">Notes:</Text>
                </HStack>
                <Text ml={6} color={textColor}>{event.data?.notes || event.data?.description}</Text>
              </Box>
            )}

            {/* Priority for reminders */}
            {event.type === 'reminder' && event.data?.priority && (
              <Box>
                <Text fontWeight="bold">Priority:</Text>
                <Badge 
                  colorScheme={
                    event.data.priority === 'high' ? 'red' : 
                    event.data.priority === 'medium' ? 'orange' : 'green'
                  }
                  ml={1}
                >
                  {event.data.priority}
                </Badge>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;

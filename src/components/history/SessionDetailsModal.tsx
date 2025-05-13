// src/components/history/SessionDetailsModal.tsx
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
  Text,
  Flex,
  Box,
  Badge,
  Divider,
  Heading,
  VStack,
  HStack,
  useColorModeValue,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { FaClock, FaBook, FaListUl, FaNoteSticky, FaCalendarDay, FaPenToSquare, FaFloppyDisk, FaXmark } from 'react-icons/fa6';
import { useAppStore } from '../../store/appStore';
import type { LoggedSession, Subject } from '../../types';
import ParallaxCard from './ParallaxCard';
import { useAdaptiveTheme } from '../../styles/emotionalDesign';

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: LoggedSession | null;
  subjects: Subject[];
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  isOpen,
  onClose,
  session,
  subjects
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { updateSession } = useAppStore();
  const streakData = useAppStore(state => state.streakData);
  
  // Get mood for adaptive UI
  const { palette } = useAdaptiveTheme(
    session?.durationMinutes || 0,
    streakData?.currentStreak || 0
  );
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    notes: string;
    focusScore: number | undefined;
    distractionsLogged: number | undefined;
  }>({ 
    notes: '',
    focusScore: undefined,
    distractionsLogged: undefined
  });
  
  // Initialize edit form when modal opens or session changes
  React.useEffect(() => {
    if (session) {
      setEditedData({
        notes: session.notes || '',
        focusScore: session.focusScore,
        distractionsLogged: session.distractionsLogged
      });
    }
  }, [session]);
  
  if (!session) return null;
  
  const subject = subjects.find(s => s.id === session.subjectId);
  const formattedDate = format(new Date(session.startTime), 'MMMM d, yyyy');
  const startTime = format(new Date(session.startTime), 'h:mm a');
  const endTime = format(new Date(session.endTime), 'h:mm a');
  
  // Calculate hours and minutes
  const hours = Math.floor(session.durationMinutes / 60);
  const minutes = session.durationMinutes % 60;
  const formattedDuration = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  
  const handleSaveChanges = () => {
    if (!session) return;
    
    const updatedSession: LoggedSession = {
      ...session,
      notes: editedData.notes.trim() || undefined,
      focusScore: editedData.focusScore,
      distractionsLogged: editedData.distractionsLogged
    };
    
    updateSession(updatedSession);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    // Reset form to original values
    if (session) {
      setEditedData({
        notes: session.notes || '',
        focusScore: session.focusScore,
        distractionsLogged: session.distractionsLogged
      });
    }
    setIsEditing(false);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Text>Study Session Details</Text>
            {!isEditing ? (
              <IconButton
                size="sm"
                icon={<FaPenToSquare />}
                aria-label="Edit session"
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <HStack>
                <IconButton
                  size="sm"
                  colorScheme="green"
                  icon={<FaFloppyDisk />}
                  aria-label="Save changes"
                  onClick={handleSaveChanges}
                />
                <IconButton
                  size="sm"
                  colorScheme="red"
                  icon={<FaXmark />}
                  aria-label="Cancel editing"
                  onClick={handleCancelEdit}
                />
              </HStack>
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={4}>
          <VStack spacing={6} align="stretch">
            {/* Header with date and subject - with parallax effect */}
            <ParallaxCard depth={0.2}>
              <Flex direction="column" gap={1} p={3} bg={`${palette.primary}15`} borderRadius="md">
                <Heading size="md" color={subject?.color || palette.primary}>
                  {subject?.name || 'Unknown Subject'}
                </Heading>
                <HStack>
                  <FaCalendarDay color={palette.secondary} />
                  <Text>{formattedDate}</Text>
                </HStack>
              </Flex>
            </ParallaxCard>
            
            <Divider />
            
            {/* Main details */}
            <Box>
              <Heading size="sm" mb={3}>Session Information</Heading>
              
              <VStack spacing={3} align="stretch">
                {/* Time & Duration - with parallax effect */}
                <ParallaxCard depth={0.15} direction="horizontal">
                  <HStack p={2} borderRadius="md" bg={`${palette.secondary}10`}>
                    <Box minW="24px">
                      <FaClock color={palette.secondary} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Time & Duration</Text>
                      <Text fontSize="sm">{startTime} - {endTime} ({formattedDuration})</Text>
                    </VStack>
                  </HStack>
                </ParallaxCard>
                
                {/* Tasks completed */}
                {session.tasksCompleted && session.tasksCompleted.length > 0 && (
                  <ParallaxCard depth={0.25}>
                    <HStack alignItems="flex-start" p={2} borderRadius="md" bg={`${palette.accent}10`}>
                      <Box minW="24px" mt={1}>
                        <FaListUl color={palette.accent} />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Tasks Completed</Text>
                        {session.tasksCompleted.map((task: string, index: number) => (
                          <Text key={index} fontSize="sm">• {task}</Text>
                        ))}
                      </VStack>
                    </HStack>
                  </ParallaxCard>
                )}
                
                {/* Materials */}
                {session.materials && session.materials.length > 0 && (
                  <ParallaxCard depth={0.2} direction="horizontal">
                    <HStack alignItems="flex-start" p={2} borderRadius="md" bg={`${palette.primary}10`}>
                      <Box minW="24px" mt={1}>
                        <FaBook color={palette.primary} />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Study Materials</Text>
                        {session.materials.map((material: string, index: number) => (
                          <Text key={index} fontSize="sm">• {material}</Text>
                        ))}
                      </VStack>
                    </HStack>
                  </ParallaxCard>
                )}
                
                {/* Notes */}
                <HStack alignItems="flex-start">
                  <Box minW="24px" mt={1}>
                    <FaNoteSticky color={palette.secondary} />
                  </Box>
                  <VStack align="start" spacing={1} width="100%">
                    <Text fontWeight="medium">Notes</Text>
                    {isEditing ? (
                      <FormControl>
                        <Textarea 
                          value={editedData.notes}
                          onChange={(e) => setEditedData({...editedData, notes: e.target.value})}
                          placeholder="Add notes about this study session"
                          rows={4}
                        />
                      </FormControl>
                    ) : (
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {session.notes || "No notes for this session."}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </VStack>
            </Box>
            
            {/* Metrics */}
            <ParallaxCard depth={0.3}>
              <Box p={3} borderRadius="lg" bg={`${palette.accent}15`}>
                <Heading size="sm" mb={2}>Performance Metrics</Heading>
                <VStack align="stretch" spacing={4}>
                  {/* Focus Score */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Focus Score (1-10)</FormLabel>
                    {isEditing ? (
                      <NumberInput 
                        value={editedData.focusScore || 0} 
                        min={0} 
                        max={10} 
                        step={0.5}
                        onChange={(_, value) => setEditedData({...editedData, focusScore: value || undefined})}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    ) : (
                      <Text>{session.focusScore !== undefined ? session.focusScore : 'Not recorded'}</Text>
                    )}
                  </FormControl>
                  
                  {/* Distractions */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Distractions Logged</FormLabel>
                    {isEditing ? (
                      <NumberInput 
                        value={editedData.distractionsLogged || 0} 
                        min={0} 
                        onChange={(_, value) => setEditedData({...editedData, distractionsLogged: value || undefined})}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    ) : (
                      <Text>{session.distractionsLogged !== undefined ? session.distractionsLogged : 'Not recorded'}</Text>
                    )}
                  </FormControl>
                </VStack>
              </Box>
            </ParallaxCard>
            
            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
              <Box>
                <Heading size="sm" mb={2}>Tags</Heading>
                <Flex gap={2} flexWrap="wrap">
                  {session.tags.map((tag: string, index: number) => (
                    <Badge key={index} colorScheme="blue" px={2} py={1} borderRadius="md">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          {isEditing ? (
            <>
              <Button colorScheme="green" mr={3} onClick={handleSaveChanges}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
// src/components/timer/StudyTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
  Textarea
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaSave } from 'react-icons/fa';

// Import the CustomSelect component using the barrel file
import { CustomSelect } from '../common';

const MotionBox = motion(Box as any);

export const StudyTimer: React.FC = () => {
  const { subjects, tasks, logSession } = useAppStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter tasks based on selected subject
  const filteredTasks = tasks.filter(
    task => task.subjectId === selectedSubjectId && !task.completed
  );

  // Format seconds as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start the timer
  const startTimer = () => {
    if (!selectedSubjectId) {
      setToastMessage('Please select a subject before starting the timer');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsRunning(true);
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }

    intervalRef.current = window.setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  // Reset the timer and show session form
  const stopTimer = () => {
    pauseTimer();
    setShowSessionForm(true);
  };

  // Save the session
  const saveSession = () => {
    if (!startTimeRef.current || seconds === 0) return;

    const endTime = new Date();
    const durationMinutes = Math.floor(seconds / 60);

    logSession({
      subjectId: selectedSubjectId,
      taskId: selectedTaskId || undefined,
      startTime: startTimeRef.current,
      endTime: endTime,
      durationMinutes,
      notes: notes.trim() || undefined
    });

    // Reset everything
    setSeconds(0);
    setNotes('');
    startTimeRef.current = null;
    setShowSessionForm(false);

    setToastMessage(`You've earned ${Math.floor(durationMinutes/10)} points for your ${durationMinutes} minutes of study time.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const bgColor = 'gray.700';
  const selectedSubject = subjects.find(subject => subject.id === selectedSubjectId);

  return (
    <MotionBox
      p={5}
      borderRadius="lg"
      bg={bgColor}
      boxShadow="xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ boxShadow: "2xl" }}
      transition={{ duration: 0.3 }}
      w="100%"
    >
      <VStack gap={4} align="stretch">
        <Heading size="md" textAlign="center">Study Timer</Heading>
        
        {toastMessage && (
          <Badge colorScheme="blue" p={2} borderRadius="md" textAlign="center">
            {toastMessage}
          </Badge>
        )}
        
        {!showSessionForm ? (
          <>
            <HStack justifyContent="center" alignItems="center">
              <Badge
                px={3}
                py={2}
                borderRadius="full"
                variant="subtle"
                colorScheme={isRunning ? "green" : "gray"}
                fontSize="lg"
              >
                {formatTime(seconds)}
              </Badge>
            </HStack>

            <Box>
              <Text mb={1} fontWeight="medium">Subject</Text>
              <CustomSelect 
                placeholder="Select a subject" 
                value={selectedSubjectId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTaskId(''); // Reset task when subject changes
                }}
                disabled={isRunning}
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </CustomSelect>
            </Box>
            
            {selectedSubjectId && (
              <Box>
                <Text mb={1} fontWeight="medium">Task (Optional)</Text>
                <CustomSelect 
                  placeholder="Select a task" 
                  value={selectedTaskId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTaskId(e.target.value)}
                  disabled={isRunning || filteredTasks.length === 0}
                >
                  {filteredTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.description}
                    </option>
                  ))}
                </CustomSelect>
              </Box>
            )}
            
            <HStack gap={4} justifyContent="center">
              {!isRunning ? (
                <Button 
                  onClick={startTimer} 
                  colorScheme="green"
                  disabled={!selectedSubjectId}
                >
                  <FaPlay style={{ marginRight: '8px' }} />
                  Start
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer} 
                  colorScheme="yellow"
                >
                  <FaPause style={{ marginRight: '8px' }} />
                  Pause
                </Button>
              )}
              <Button 
                onClick={stopTimer} 
                colorScheme="red"
                disabled={seconds === 0}
              >
                <FaStop style={{ marginRight: '8px' }} />
                Stop
              </Button>
            </HStack>
          </>
        ) : (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VStack gap={4} align="stretch">
              <Heading size="sm">Log Your Study Session</Heading>
              
              <Text>
                Duration: <Badge colorScheme="purple">{formatTime(seconds)}</Badge>
              </Text>
              
              <Text>
                Subject: <Badge colorScheme="blue">{selectedSubject?.name}</Badge>
              </Text>
              
              {selectedTaskId && (
                <Text>
                  Task: <Badge colorScheme="teal">
                    {tasks.find(t => t.id === selectedTaskId)?.description}
                  </Badge>
                </Text>
              )}
              
              <Box>
                <Text mb={1} fontWeight="medium">Session Notes (Optional)</Text>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you accomplish? Any challenges?"
                  size="sm"
                  rows={3}
                />
              </Box>
              
              <HStack gap={4} justifyContent="center">
                <Button 
                  onClick={saveSession} 
                  colorScheme="brand"
                  disabled={seconds === 0}
                >
                  <FaSave style={{ marginRight: '8px' }} />
                  Save Session
                </Button>
                <Button 
                  onClick={() => {
                    setShowSessionForm(false);
                    startTimeRef.current = null;
                    setSeconds(0);
                  }} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
        )}
      </VStack>
    </MotionBox>
  );
};
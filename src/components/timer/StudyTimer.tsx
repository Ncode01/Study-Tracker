// src/components/timer/StudyTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
  Textarea,
  ChakraProvider
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaSave } from 'react-icons/fa';

// Import custom components and hooks
import { CustomSelect } from '../common';
import ThreeDProgressRing from '../ui/ThreeDProgressRing';
import ClayButton from '../ui/ClayButton';
import { useAdaptiveTheme, generateEmpatheticMessage } from '../../styles/emotionalDesign';
import type { MoodType } from '../../styles/emotionalDesign';
import { createAdaptiveTheme } from '../../styles/theme';

const MotionBox = motion(Box);

export const StudyTimer: React.FC = () => {
  const { subjects, tasks, logSession, streakData } = useAppStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [empatheticMessage, setEmpatheticMessage] = useState<string>('');
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const minutesRef = useRef<number>(0);
  
  // Adaptive theme based on study duration and streak
  const { mood, palette } = useAdaptiveTheme(
    Math.floor(seconds / 60), // Study duration in minutes
    streakData?.currentStreak || 0, // Consecutive days streak
    seconds > 3000 // Whether user has been studying >50 minutes (needs a break)
  );
  
  // Create a dynamic theme based on the current mood
  const dynamicTheme = createAdaptiveTheme(mood);

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

  // Generate and update empathetic messages based on user progress
  useEffect(() => {
    const currentMinutes = Math.floor(seconds / 60);
    
    // Update message when milestone minutes are reached or every 15 minutes
    if (
      (currentMinutes !== minutesRef.current && 
       (currentMinutes === 25 || currentMinutes === 50 || 
        currentMinutes === 90 || currentMinutes % 15 === 0)) ||
      empatheticMessage === ''
    ) {
      const message = generateEmpatheticMessage(
        currentMinutes,
        streakData?.currentStreak || 0
      );
      setEmpatheticMessage(message);
      minutesRef.current = currentMinutes;
    }
  }, [seconds, streakData?.currentStreak, empatheticMessage]);

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

  // Calculate progress percentage for the timer ring
  const calculateProgress = () => {
    // Target minutes based on the currently selected subject
    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    const targetHours = selectedSubject?.targetHours || 1;
    const targetSeconds = targetHours * 60 * 60;
    
    // Cap progress at 100%
    return Math.min(seconds / targetSeconds, 1);
  };

  const selectedSubject = subjects.find(subject => subject.id === selectedSubjectId);

  return (
    <ChakraProvider theme={dynamicTheme}>
      <MotionBox
        p={5}
        borderRadius="lg"
        bg="transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mood-gradient"
        boxShadow="xl"
        w="100%"
      >
        <VStack gap={4} align="stretch">
          <Heading size="md" textAlign="center">Study Timer</Heading>
          
          {/* Empathetic Message */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={empatheticMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              p={3}
              borderRadius="md"
              bg={`${palette.primary}20`}
              border={`1px solid ${palette.accent}`}
              textAlign="center"
            >
              <Text fontSize="md" fontWeight="bold" className="mood-accent">
                {empatheticMessage}
              </Text>
            </MotionBox>
          </AnimatePresence>
          
          {toastMessage && (
            <Badge colorScheme="blue" p={2} borderRadius="md" textAlign="center">
              {toastMessage}
            </Badge>
          )}
          
          {!showSessionForm ? (
            <>
              <Box display="flex" justifyContent="center" alignItems="center" position="relative" h="300px">
                <ThreeDProgressRing 
                  progress={calculateProgress()}
                  mood={mood as MoodType}
                  size={280}
                  interactive={true}
                />
                
                <Box 
                  position="absolute" 
                  top="50%" 
                  left="50%" 
                  transform="translate(-50%, -50%)"
                  zIndex={2}
                  textAlign="center"
                >
                  <Heading size="xl" textShadow="0 0 10px rgba(0,0,0,0.3)">
                    {formatTime(seconds)}
                  </Heading>
                  {selectedSubject && (
                    <Text fontWeight="medium" mt={1}>
                      {selectedSubject.name}
                    </Text>
                  )}
                </Box>
              </Box>

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
                  <ClayButton 
                    onClick={startTimer} 
                    colorScheme="green"
                    disabled={!selectedSubjectId}
                    leftIcon={<FaPlay />}
                  >
                    Start
                  </ClayButton>
                ) : (
                  <ClayButton 
                    onClick={pauseTimer} 
                    colorScheme="yellow"
                    leftIcon={<FaPause />}
                  >
                    Pause
                  </ClayButton>
                )}
                <ClayButton 
                  onClick={stopTimer} 
                  colorScheme="red"
                  disabled={seconds === 0}
                  leftIcon={<FaStop />}
                >
                  Stop
                </ClayButton>
              </HStack>
            </>
          ) : (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
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
                  <ClayButton 
                    onClick={saveSession} 
                    colorScheme="brand"
                    disabled={seconds === 0}
                    leftIcon={<FaSave />}
                  >
                    Save Session
                  </ClayButton>
                  <ClayButton 
                    onClick={() => {
                      setShowSessionForm(false);
                      startTimeRef.current = null;
                      setSeconds(0);
                    }} 
                    variant="outline"
                  >
                    Cancel
                  </ClayButton>
                </HStack>
              </VStack>
            </MotionBox>
          )}
        </VStack>
      </MotionBox>
    </ChakraProvider>
  );
};
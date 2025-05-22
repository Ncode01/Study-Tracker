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
  ChakraProvider,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaSave, FaCalendarAlt } from 'react-icons/fa';

// Import custom components and hooks
import { CustomSelect } from '../common';
import ThreeDProgressRing from '../ui/ThreeDProgressRing';
import ClayButton from '../ui/ClayButton';
import { useAdaptiveTheme, generateEmpatheticMessage } from '../../styles/emotionalDesign';
import type { MoodType } from '../../styles/emotionalDesign';
import { createAdaptiveTheme } from '../../styles/theme';

// Import calendar integration
import { handleStudySessionCompleted } from '../calendar/calendarIntegration';

const MotionBox = motion(Box);

const TimerDisplay: React.FC<{ seconds: number; selectedSubject: any; mood: MoodType; calculateProgress: () => number; }> = ({ seconds, selectedSubject, mood, calculateProgress }) => {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" position="relative" h="300px">
      <ThreeDProgressRing 
        progress={calculateProgress()}
        mood={mood}
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
  );
};

const SessionForm: React.FC<{ 
  seconds: number; 
  selectedSubject: any; 
  selectedTaskId: string; 
  tasks: any[]; 
  notes: string; 
  setNotes: (notes: string) => void; 
  addToCalendar: boolean; 
  setAddToCalendar: (addToCalendar: boolean) => void; 
  saveSession: () => void; 
  cancelSession: () => void; 
}> = ({ seconds, selectedSubject, selectedTaskId, tasks, notes, setNotes, addToCalendar, setAddToCalendar, saveSession, cancelSession }) => {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
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
        
        {/* Calendar integration toggle */}
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="calendar-toggle" mb="0" fontSize="sm">
            <HStack>
              <FaCalendarAlt />
              <Text>Add to Calendar</Text>
            </HStack>
          </FormLabel>
          <Switch 
            id="calendar-toggle" 
            isChecked={addToCalendar}
            onChange={() => setAddToCalendar(!addToCalendar)}
            colorScheme="blue"
          />
        </FormControl>
        
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
            onClick={cancelSession} 
            variant="outline"
          >
            Cancel
          </ClayButton>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

export const StudyTimer: React.FC = () => {
  const { subjects, tasks, logSession, streakData } = useAppStore();
  const [state, setState] = useState({
    selectedSubjectId: '',
    selectedTaskId: '',
    isRunning: false,
    seconds: 0,
    notes: '',
    showSessionForm: false,
    toastMessage: null,
    empatheticMessage: '',
    addToCalendar: true
  });
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const minutesRef = useRef<number>(0);
  
  // Adaptive theme based on study duration and streak
  const { mood, palette } = useAdaptiveTheme(
    Math.floor(state.seconds / 60), // Study duration in minutes
    streakData?.currentStreak || 0, // Consecutive days streak
    state.seconds > 3000 // Whether user has been studying >50 minutes (needs a break)
  );
  
  // Create a dynamic theme based on the current mood
  const dynamicTheme = createAdaptiveTheme(mood);

  // Filter tasks based on selected subject
  const filteredTasks = tasks.filter(
    task => task.subjectId === state.selectedSubjectId && !task.completed
  );

  // Generate and update empathetic messages based on user progress
  useEffect(() => {
    const currentMinutes = Math.floor(state.seconds / 60);
    
    // Update message when milestone minutes are reached or every 15 minutes
    if (
      (currentMinutes !== minutesRef.current && 
       (currentMinutes === 25 || currentMinutes === 50 || 
        currentMinutes === 90 || currentMinutes % 15 === 0)) ||
      state.empatheticMessage === ''
    ) {
      const message = generateEmpatheticMessage(
        currentMinutes,
        streakData?.currentStreak || 0
      );
      setState(prevState => ({ ...prevState, empatheticMessage: message }));
      minutesRef.current = currentMinutes;
    }
  }, [state.seconds, streakData?.currentStreak, state.empatheticMessage]);

  // Start the timer
  const startTimer = () => {
    if (!state.selectedSubjectId) {
      setState(prevState => ({ ...prevState, toastMessage: 'Please select a subject before starting the timer' }));
      setTimeout(() => setState(prevState => ({ ...prevState, toastMessage: null })), 3000);
      return;
    }

    setState(prevState => ({ ...prevState, isRunning: true }));
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }

    intervalRef.current = window.setInterval(() => {
      setState(prevState => ({ ...prevState, seconds: prevState.seconds + 1 }));
    }, 1000);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prevState => ({ ...prevState, isRunning: false }));
  };

  // Reset the timer and show session form
  const stopTimer = () => {
    pauseTimer();
    setState(prevState => ({ ...prevState, showSessionForm: true }));
  };

  // Save the session
  const saveSession = async () => {
    if (!startTimeRef.current || state.seconds === 0) return;

    const endTime = new Date();
    const durationMinutes = Math.floor(state.seconds / 60);

    // Log the session and get the created session
    const newSession = await logSession({
      subjectId: state.selectedSubjectId,
      taskId: state.selectedTaskId || undefined,
      startTime: startTimeRef.current,
      endTime: endTime,
      durationMinutes,
      notes: state.notes.trim() || undefined
    });

    // Add to calendar if the option is enabled
    if (state.addToCalendar && newSession) {
      try {
        // Wait for the calendar operation to complete
        await handleStudySessionCompleted(newSession);
        setState(prevState => ({ ...prevState, toastMessage: `Study session added to calendar and you've earned ${Math.floor(durationMinutes/10)} points!` }));
      } catch (error) {
        console.error('Error adding session to calendar:', error);
        setState(prevState => ({ ...prevState, toastMessage: `You've earned ${Math.floor(durationMinutes/10)} points for your ${durationMinutes} minutes of study time.` }));
      }
    } else {
      setState(prevState => ({ ...prevState, toastMessage: `You've earned ${Math.floor(durationMinutes/10)} points for your ${durationMinutes} minutes of study time.` }));
    }

    // Reset everything
    setState({
      selectedSubjectId: '',
      selectedTaskId: '',
      isRunning: false,
      seconds: 0,
      notes: '',
      showSessionForm: false,
      toastMessage: null,
      empatheticMessage: '',
      addToCalendar: true
    });
    startTimeRef.current = null;
    
    setTimeout(() => setState(prevState => ({ ...prevState, toastMessage: null })), 5000);
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
    const selectedSubject = subjects.find(s => s.id === state.selectedSubjectId);
    const targetHours = selectedSubject?.targetHours || 1;
    const targetSeconds = targetHours * 60 * 60;
    
    // Cap progress at 100%
    return Math.min(state.seconds / targetSeconds, 1);
  };

  const selectedSubject = subjects.find(subject => subject.id === state.selectedSubjectId);

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
              key={state.empatheticMessage}
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
                {state.empatheticMessage}
              </Text>
            </MotionBox>
          </AnimatePresence>
          
          {state.toastMessage && (
            <Badge colorScheme="blue" p={2} borderRadius="md" textAlign="center">
              {state.toastMessage}
            </Badge>
          )}
          
          {!state.showSessionForm ? (
            <>
              <TimerDisplay 
                seconds={state.seconds} 
                selectedSubject={selectedSubject} 
                mood={mood as MoodType} 
                calculateProgress={calculateProgress} 
              />

              <Box>
                <Text mb={1} fontWeight="medium">Subject</Text>
                <CustomSelect 
                  placeholder="Select a subject" 
                  value={state.selectedSubjectId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setState(prevState => ({ ...prevState, selectedSubjectId: e.target.value, selectedTaskId: '' }));
                  }}
                  disabled={state.isRunning}
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </CustomSelect>
              </Box>
              
              {state.selectedSubjectId && (
                <Box>
                  <Text mb={1} fontWeight="medium">Task (Optional)</Text>
                  <CustomSelect 
                    placeholder="Select a task" 
                    value={state.selectedTaskId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setState(prevState => ({ ...prevState, selectedTaskId: e.target.value }))}
                    disabled={state.isRunning || filteredTasks.length === 0}
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
                {!state.isRunning ? (
                  <ClayButton 
                    onClick={startTimer} 
                    colorScheme="green"
                    disabled={!state.selectedSubjectId}
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
                  disabled={state.seconds === 0}
                  leftIcon={<FaStop />}
                >
                  Stop
                </ClayButton>
              </HStack>
            </>
          ) : (
            <SessionForm 
              seconds={state.seconds} 
              selectedSubject={selectedSubject} 
              selectedTaskId={state.selectedTaskId} 
              tasks={tasks} 
              notes={state.notes} 
              setNotes={(notes) => setState(prevState => ({ ...prevState, notes }))}
              addToCalendar={state.addToCalendar} 
              setAddToCalendar={(addToCalendar) => setState(prevState => ({ ...prevState, addToCalendar }))}
              saveSession={saveSession} 
              cancelSession={() => {
                setState(prevState => ({ ...prevState, showSessionForm: false }));
                startTimeRef.current = null;
                setState(prevState => ({ ...prevState, seconds: 0 }));
              }} 
            />
          )}
        </VStack>
      </MotionBox>
    </ChakraProvider>
  );
};

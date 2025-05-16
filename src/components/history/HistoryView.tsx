import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  Text,
  Heading,
  useDisclosure,
  useColorModeValue,
  Badge,
  Flex,
  Icon
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CSVLink } from 'react-csv';
import { format, subDays, startOfWeek } from 'date-fns';
import { FaDownload, FaFire } from 'react-icons/fa';
import { useAppStore } from '../../store/appStore';
import { SessionFilters } from './SessionFilters';
import { WeeklySummaryChart } from './WeeklySummaryChart';
import { StudyHeatmap } from './StudyHeatmap';
import { SessionDetailsModal } from './SessionDetailsModal';
import type { LoggedSession, SessionFilters as SessionFiltersType, WeeklySummary } from '../../types';

const MotionBox = motion(Box);

export const HistoryView: React.FC = () => {
  const { subjects, tasks, loggedSessions, streakData } = useAppStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSession, setSelectedSession] = useState<LoggedSession | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const [filters, setFilters] = useState<SessionFiltersType>({
    dateRange: '30days',
    taskStatus: 'all'
  });
  
  const filteredSessions = useMemo(() => {
    let filtered = [...loggedSessions];
    
    if (filters.subjectId) {
      filtered = filtered.filter(session => session.subjectId === filters.subjectId);
    }
    
    const today = new Date();
    if (filters.dateRange === '7days') {
      const startDate = subDays(today, 7);
      filtered = filtered.filter(session => 
        new Date(session.startTime) >= startDate
      );
    } else if (filters.dateRange === '30days') {
      const startDate = subDays(today, 30);
      filtered = filtered.filter(session => 
        new Date(session.startTime) >= startDate
      );
    } else if (filters.dateRange === 'custom' && filters.startDate) {
      filtered = filtered.filter(session => 
        new Date(session.startTime) >= filters.startDate!
      );
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(session => 
          new Date(session.startTime) <= endDate
        );
      }
    }
    
    return filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [loggedSessions, filters]);
  
  const weeklySummaryData = useMemo(() => {
    const weeklyData: Record<string, WeeklySummary> = {};
    
    filteredSessions.forEach(session => {
      const startDate = new Date(session.startTime);
      const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const hours = session.durationMinutes / 60;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: format(weekStart, 'MMM d'),
          totalHours: 0,
          targetHours: 0,
          subjectBreakdown: {}
        };
        
        subjects.forEach(subject => {
          if (subject.targetHours) {
            const weeklyTarget = subject.targetHours / 52;
            weeklyData[weekKey].targetHours += weeklyTarget;
          }
        });
      }
      
      weeklyData[weekKey].totalHours += hours;
      
      if (!weeklyData[weekKey].subjectBreakdown[session.subjectId]) {
        weeklyData[weekKey].subjectBreakdown[session.subjectId] = 0;
      }
      weeklyData[weekKey].subjectBreakdown[session.subjectId] += hours;
    });
    
    return Object.values(weeklyData).sort((a, b) => 
      new Date(a.week).getTime() - new Date(b.week).getTime()
    );
  }, [filteredSessions, subjects]);
  
  const csvData = useMemo(() => {
    return filteredSessions.map(session => {
      const subject = subjects.find(s => s.id === session.subjectId);
      const task = session.taskId ? tasks.find(t => t.id === session.taskId) : null;
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      
      return {
        'Date': format(startTime, 'yyyy-MM-dd'),
        'Start Time': format(startTime, 'HH:mm'),
        'End Time': format(endTime, 'HH:mm'),
        'Duration (min)': session.durationMinutes,
        'Subject': subject?.name || 'Unknown',
        'Task': task?.description || 'N/A',
        'Focus Score': session.focusScore || 'N/A',
        'Distractions': session.distractionsLogged || 'N/A',
        'Notes': session.notes || ''
      };
    });
  }, [filteredSessions, subjects, tasks]);
  
  const handleSessionClick = useCallback((session: LoggedSession) => {
    setSelectedSession(session);
    onOpen();
  }, [onOpen]);
  
  const handleFilterChange = useCallback((newFilters: SessionFiltersType) => {
    setFilters(newFilters);
  }, []);
  
  const totalHours = filteredSessions.reduce(
    (sum, session) => sum + (session.durationMinutes / 60), 
    0
  ).toFixed(1);
  
  return (
    <VStack spacing={6} align="stretch" pb={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="lg">Study History</Heading>
        
        <HStack>
          {streakData.currentStreak > 0 && (
            <Badge 
              colorScheme="orange" 
              display="flex" 
              alignItems="center" 
              px={3} 
              py={2} 
              borderRadius="full"
            >
              <Icon 
                as={FaFire} 
                mr={2} 
                color={streakData.currentStreak >= 3 ? "yellow.400" : "orange.400"}
                animation={streakData.currentStreak >= 3 ? "flame-pulse 1.5s infinite" : undefined}
                sx={{
                  '@keyframes flame-pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)' },
                  }
                }}
              />
              <Text>{streakData.currentStreak} day streak</Text>
            </Badge>
          )}
          
          {filteredSessions.length > 0 && (
            <CSVLink 
              data={csvData} 
              filename={`study-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            >
              <Button leftIcon={<FaDownload />} size="sm" colorScheme="blue">
                Export CSV
              </Button>
            </CSVLink>
          )}
        </HStack>
      </Flex>
      
      <SessionFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {filteredSessions.length > 0 && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          bg={bgColor}
          p={6}
          borderRadius="xl"
          boxShadow="lg"
          mb={2}
        >
          <Grid 
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
            gap={4}
          >
            <GridItem>
              <Flex direction="column" align="center" justify="center" p={4} bg="gray.700" borderRadius="md">
                <Text color="gray.400" fontSize="sm">Total Study Time</Text>
                <Text fontSize="2xl" fontWeight="bold">{totalHours} hours</Text>
              </Flex>
            </GridItem>
            
            <GridItem>
              <Flex direction="column" align="center" justify="center" p={4} bg="gray.700" borderRadius="md">
                <Text color="gray.400" fontSize="sm">Study Sessions</Text>
                <Text fontSize="2xl" fontWeight="bold">{filteredSessions.length}</Text>
              </Flex>
            </GridItem>
            
            <GridItem>
              <Flex direction="column" align="center" justify="center" p={4} bg="gray.700" borderRadius="md">
                <Text color="gray.400" fontSize="sm">Focus Score</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {filteredSessions.some(s => s.focusScore !== undefined) 
                    ? (filteredSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / 
                      filteredSessions.filter(s => s.focusScore !== undefined).length).toFixed(1)
                    : 'N/A'}
                </Text>
              </Flex>
            </GridItem>
          </Grid>
        </MotionBox>
      )}
      
      <Grid 
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={6}
      >
        <GridItem>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WeeklySummaryChart data={weeklySummaryData} />
          </MotionBox>
        </GridItem>
        
        <GridItem>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StudyHeatmap 
              sessions={loggedSessions}
              startDate={filters.dateRange === 'custom' ? filters.startDate : undefined}
              endDate={filters.dateRange === 'custom' ? filters.endDate : undefined}
            />
          </MotionBox>
        </GridItem>
      </Grid>
      
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        bg={bgColor}
        p={6}
        borderRadius="xl"
        boxShadow="lg"
      >
        <Heading size="md" mb={4}>Recent Sessions</Heading>
        
        {filteredSessions.length === 0 ? (
          <Text textAlign="center" color="gray.500" p={4}>
            No study sessions found with the current filters.
          </Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {filteredSessions.slice(0, 5).map(session => {
              const subject = subjects.find(s => s.id === session.subjectId);
              const sessionDate = new Date(session.startTime);
              const hours = Math.floor(session.durationMinutes / 60);
              const minutes = session.durationMinutes % 60;
              
              return (
                <MotionBox
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  p={4}
                  borderRadius="md"
                  bg="gray.700"
                  cursor="pointer"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Badge 
                          colorScheme="purple" 
                          fontSize="xs"
                        >
                          {format(sessionDate, 'MMM d, yyyy')}
                        </Badge>
                        <Badge 
                          colorScheme="blue" 
                          fontSize="xs"
                        >
                          {format(sessionDate, 'h:mm a')}
                        </Badge>
                        {subject && (
                          <Badge
                            bg={subject.color}
                            color="gray.800"
                          >
                            {subject.name}
                          </Badge>
                        )}
                      </HStack>
                      <Text>{hours}h {minutes}m</Text>
                      {session.notes && (
                        <Text fontSize="sm" color="gray.400" noOfLines={1}>
                          {session.notes}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                </MotionBox>
              );
            })}
            
            {filteredSessions.length > 5 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Showing 5 of {filteredSessions.length} sessions
              </Text>
            )}
          </VStack>
        )}
      </MotionBox>
      
      <SessionDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        session={selectedSession}
        subjects={subjects}
      />
    </VStack>
  );
};

// src/components/history/StudyHeatmap.tsx
import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
  HStack,
  useTheme
} from '@chakra-ui/react';
import { format, parseISO, eachDayOfInterval, subDays, addDays, startOfWeek, isSameDay } from 'date-fns';
import { LoggedSession } from '../../types';

interface StudyHeatmapProps {
  sessions: LoggedSession[];
  daysToShow?: number;
}

export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ 
  sessions, 
  daysToShow = 60  // Default to showing 60 days
}) => {
  const theme = useTheme();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const dayBgColor = useColorModeValue('gray.100', 'gray.700');
  
  // Define intensity colors
  const intensityColors = [
    useColorModeValue('blue.50', 'blue.900'),    // Level 0 (lightest)
    useColorModeValue('blue.100', 'blue.800'),   // Level 1
    useColorModeValue('blue.200', 'blue.700'),   // Level 2
    useColorModeValue('blue.300', 'blue.600'),   // Level 3
    useColorModeValue('blue.400', 'blue.500'),   // Level 4
    useColorModeValue('blue.500', 'blue.400'),   // Level 5 (darkest)
  ];

  // Generate date range for the heatmap
  const today = new Date();
  const dateRange = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(today, daysToShow),
      end: today
    });
  }, [daysToShow, today]);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const groupedSessions: { [date: string]: LoggedSession[] } = {};
    
    sessions.forEach(session => {
      const date = format(new Date(session.startTime), 'yyyy-MM-dd');
      if (!groupedSessions[date]) {
        groupedSessions[date] = [];
      }
      groupedSessions[date].push(session);
    });
    
    return groupedSessions;
  }, [sessions]);
  
  // Calculate max minutes for the color scaling
  const maxMinutesPerDay = useMemo(() => {
    let max = 120; // Set a default max (2 hours)
    
    Object.values(sessionsByDate).forEach(daySessions => {
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
      if (totalMinutes > max) {
        max = totalMinutes;
      }
    });
    
    return max;
  }, [sessionsByDate]);
  
  // Split dates into weeks for display
  const weeks = useMemo(() => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    const firstDay = startOfWeek(dateRange[0], { weekStartsOn: 0 });
    let currentDate = firstDay;
    
    // Add days before our range to fill the first week
    while (currentDate < dateRange[0]) {
      currentWeek.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    
    // Add all days in our range
    dateRange.forEach(date => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(date);
    });
    
    // Fill the last week if needed
    while (currentWeek.length < 7) {
      currentDate = addDays(currentWeek[currentWeek.length - 1], 1);
      currentWeek.push(currentDate);
    }
    
    weeks.push(currentWeek);
    return weeks;
  }, [dateRange]);
  
  // Calculate color intensity based on study time
  const getIntensityColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const sessionsForDay = sessionsByDate[dateStr] || [];
    
    if (sessionsForDay.length === 0) {
      return intensityColors[0]; // No sessions
    }
    
    const totalMinutes = sessionsForDay.reduce((sum, session) => 
      sum + session.durationMinutes, 0);
    
    // Calculate intensity level (0-5)
    const percentage = Math.min(totalMinutes / maxMinutesPerDay, 1);
    const level = Math.floor(percentage * 5);
    
    return intensityColors[level];
  };
  
  const getDayTooltip = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const sessionsForDay = sessionsByDate[dateStr] || [];
    
    if (sessionsForDay.length === 0) {
      return `${format(date, 'MMM d, yyyy')}: No study sessions`;
    }
    
    const totalMinutes = sessionsForDay.reduce((sum, session) => 
      sum + session.durationMinutes, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let timeText = '';
    if (hours > 0) {
      timeText += `${hours}h `;
    }
    if (minutes > 0 || hours === 0) {
      timeText += `${minutes}m`;
    }
    
    return `${format(date, 'MMM d, yyyy')}: ${timeText} (${sessionsForDay.length} ${sessionsForDay.length === 1 ? 'session' : 'sessions'})`;
  };
  
  // Day of week labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor}>
      <Text fontWeight="medium" mb={4}>Study Activity</Text>
      
      <Flex align="flex-start">
        {/* Day of week labels */}
        <VStack spacing={2} mr={2} pt={6}>
          {weekdays.map((day, index) => (
            <Text key={index} fontSize="xs" color={textColor} height="14px">
              {day}
            </Text>
          ))}
        </VStack>
        
        {/* Heatmap grid */}
        <VStack spacing={2} align="stretch">
          {weeks.map((week, weekIndex) => (
            <HStack key={weekIndex} spacing={2}>
              {week.map((day, dayIndex) => {
                const isOutsideRange = day < subDays(today, daysToShow) || day > today;
                const isToday = isSameDay(day, today);
                
                return (
                  <Tooltip 
                    key={dayIndex} 
                    label={getDayTooltip(day)} 
                    aria-label="Study time"
                    hasArrow
                  >
                    <Box
                      w="14px"
                      h="14px"
                      borderRadius="sm"
                      bg={isOutsideRange ? 'transparent' : getIntensityColor(day)}
                      border={isToday ? '1px solid' : 'none'}
                      borderColor="blue.500"
                      opacity={isOutsideRange ? 0.3 : 1}
                      _hover={{ transform: 'scale(1.1)' }}
                      transition="transform 0.2s"
                    />
                  </Tooltip>
                );
              })}
            </HStack>
          ))}
        </VStack>
      </Flex>
      
      {/* Legend */}
      <Flex justify="flex-end" mt={4} align="center">
        <Text fontSize="xs" color={textColor} mr={2}>Less</Text>
        <Flex>
          {intensityColors.map((color, index) => (
            <Box 
              key={index} 
              w="14px" 
              h="14px" 
              bg={color} 
              borderRadius="sm"
              ml={index > 0 ? '2px' : 0}
            />
          ))}
        </Flex>
        <Text fontSize="xs" color={textColor} ml={2}>More</Text>
      </Flex>
    </Box>
  );
};
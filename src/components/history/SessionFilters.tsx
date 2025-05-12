// src/components/history/SessionFilters.tsx
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Select,
  Collapse,
  IconButton
} from '@chakra-ui/react';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAppStore } from '../../store/appStore';
import type { SessionFilters as SessionFiltersType } from '../../types';

interface SessionFiltersProps {
  filters: SessionFiltersType;
  onFilterChange: (filters: SessionFiltersType) => void;
}

export const SessionFilters: React.FC<SessionFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [isExpanded, setIsExpanded] = useState(false);
  const { subjects } = useAppStore();

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDateRange = e.target.value as 'all' | '7days' | '30days' | 'custom';
    onFilterChange({ ...filters, dateRange: newDateRange });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value || undefined;
    onFilterChange({ ...filters, subjectId });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value ? new Date(e.target.value) : undefined;
    onFilterChange({ ...filters, startDate });
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value ? new Date(e.target.value) : undefined;
    onFilterChange({ ...filters, endDate });
  };

  const handleTaskStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const taskStatus = e.target.value as 'all' | 'completed' | 'incomplete';
    onFilterChange({ ...filters, taskStatus });
  };

  const resetFilters = () => {
    onFilterChange({
      dateRange: '30days',
      taskStatus: 'all'
    });
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <Box 
      bg={bgColor} 
      p={4} 
      borderRadius="lg" 
      boxShadow="sm"
      mb={4}
      border="1px solid"
      borderColor={borderColor}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <HStack>
          <FaFilter />
          <Text fontWeight="medium">Filters</Text>
        </HStack>
        <IconButton
          icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          size="sm"
          variant="ghost"
          onClick={toggleExpand}
        />
      </Flex>
      
      <Collapse in={isExpanded} animateOpacity>
        <Flex 
          direction={{ base: "column", md: "row" }} 
          wrap="wrap" 
          gap={4} 
          mt={4}
        >
          <FormControl w={{ base: "100%", md: "200px" }}>
            <FormLabel fontSize="sm">Subject</FormLabel>
            <Select
              value={filters.subjectId || ""}
              onChange={handleSubjectChange}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl w={{ base: "100%", md: "180px" }}>
            <FormLabel fontSize="sm">Date Range</FormLabel>
            <Select
              value={filters.dateRange}
              onChange={handleDateRangeChange}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </Select>
          </FormControl>
          
          {filters.dateRange === 'custom' && (
            <>
              <FormControl w={{ base: "100%", md: "180px" }}>
                <FormLabel fontSize="sm">Start Date</FormLabel>
                <Input 
                  type="date" 
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''} 
                  onChange={handleStartDateChange}
                  size="md"
                />
              </FormControl>
              
              <FormControl w={{ base: "100%", md: "180px" }}>
                <FormLabel fontSize="sm">End Date</FormLabel>
                <Input 
                  type="date" 
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''} 
                  onChange={handleEndDateChange}
                  size="md"
                />
              </FormControl>
            </>
          )}
          
          <FormControl w={{ base: "100%", md: "180px" }}>
            <FormLabel fontSize="sm">Task Status</FormLabel>
            <Select
              value={filters.taskStatus}
              onChange={handleTaskStatusChange}
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </Select>
          </FormControl>
        </Flex>
        
        <Flex justify="flex-end" mt={4}>
          <Button size="sm" colorScheme="gray" onClick={resetFilters} mr={2}>
            Reset
          </Button>
        </Flex>
      </Collapse>
    </Box>
  );
};
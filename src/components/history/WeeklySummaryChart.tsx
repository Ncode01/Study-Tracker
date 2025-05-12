// src/components/history/WeeklySummaryChart.tsx
import React from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { WeeklySummary } from '../../types';

interface WeeklySummaryChartProps {
  data: WeeklySummary[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Box
        bg="gray.800"
        p={3}
        borderRadius="md"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.700"
      >
        <Text fontWeight="bold" mb={1}>{`Week of ${label}`}</Text>
        <Text color="blue.300">{`Total: ${payload[0].value.toFixed(1)} hours`}</Text>
        <Text color="purple.300">{`Target: ${data.targetHours.toFixed(1)} hours`}</Text>
        
        {/* Subject breakdown */}
        {Object.entries(data.subjectBreakdown).length > 0 && (
          <>
            <Text fontWeight="bold" fontSize="sm" mt={2} mb={1}>Subject Breakdown:</Text>
            {Object.entries(data.subjectBreakdown).map(([subjectId, hours]) => (
              <Text key={subjectId} fontSize="xs">
                {subjectId}: {Number(hours).toFixed(1)} hours
              </Text>
            ))}
          </>
        )}
      </Box>
    );
  }
  
  return null;
};

export const WeeklySummaryChart: React.FC<WeeklySummaryChartProps> = ({ data }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const axisColor = useColorModeValue('gray.600', 'gray.400');
  
  // Calculate max value for the y-axis
  const maxValue = Math.max(
    ...data.map(week => Math.max(week.totalHours, week.targetHours)),
    10 // Minimum max value
  );
  
  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="lg"
      boxShadow="sm"
      height="300px"
      width="100%"
    >
      <Heading size="sm" mb={4}>Weekly Study Progress</Heading>
      
      {data.length === 0 ? (
        <Flex justify="center" align="center" height="80%">
          <Text color="gray.500">No data available</Text>
        </Flex>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gray.700" />
            <XAxis 
              dataKey="week" 
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={{ stroke: 'gray.600' }}
              tickLine={{ stroke: 'gray.600' }}
            />
            <YAxis 
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={{ stroke: 'gray.600' }}
              tickLine={{ stroke: 'gray.600' }}
              domain={[0, Math.ceil(maxValue * 1.2)]} // Add some padding
              label={{ 
                value: 'Hours', 
                position: 'insideLeft',
                angle: -90, 
                style: { textAnchor: 'middle', fill: axisColor, fontSize: 12 },
                dy: 50
              }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Target hours line */}
            <Bar 
              dataKey="targetHours" 
              name="Target Hours"
              fill="purple.400"
              fillOpacity={0.3}
              maxBarSize={30}
            />
            
            {/* Actual hours bar */}
            <Bar 
              dataKey="totalHours" 
              name="Study Hours"
              fill="blue.500"
              maxBarSize={30}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.totalHours >= entry.targetHours ? '#68D391' : '#4299E1'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};
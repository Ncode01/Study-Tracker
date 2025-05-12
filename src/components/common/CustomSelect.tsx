// src/components/common/CustomSelect.tsx
import React from 'react';
import { Box, factory } from '@chakra-ui/react';

interface CustomSelectProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

// Create a chakra-wrapped select element using factory for v3
const ChakraSelect = factory.element("select");

export const CustomSelect = ({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  required,
  disabled,
  children
}: CustomSelectProps) => (
  <Box position="relative" width="100%">
    <ChakraSelect
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      width="100%"
      height="40px"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.300"
      bg="gray.700"
      color={disabled ? "gray.500" : "white"}
      px={3}
      appearance="none"
      _focus={{
        borderColor: 'brand.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)'
      }}
      _disabled={{
        opacity: 0.7,
        cursor: "not-allowed"
      }}
    >
      {placeholder && (
        <option value="" disabled={required}>
          {placeholder}
        </option>
      )}
      {children}
    </ChakraSelect>
    <Box
      position="absolute"
      right="10px"
      top="50%"
      transform="translateY(-50%)"
      pointerEvents="none"
      fontSize="16px"
      color={disabled ? "gray.500" : "gray.300"}
    >
      ▼
    </Box>
  </Box>
);
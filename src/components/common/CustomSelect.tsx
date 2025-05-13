// src/components/common/CustomSelect.tsx
import React from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Box } from '@chakra-ui/react';

interface CustomSelectProps {
  name?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const CustomSelect = ({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  required,
  disabled,
  children
}: CustomSelectProps) => {
  // Create a wrapper function to handle the onChange event
  const handleChange = (e: FormEvent<HTMLDivElement>) => {
    // Cast the event target to HTMLSelectElement
    const target = e.target as HTMLSelectElement;
    // Create a new ChangeEvent with the correct type
    const syntheticEvent = {
      target,
      currentTarget: target,
      type: e.type,
      bubbles: e.bubbles,
      cancelable: e.cancelable,
      defaultPrevented: e.defaultPrevented,
      timeStamp: e.timeStamp,
      nativeEvent: e.nativeEvent,
      preventDefault: e.preventDefault,
      stopPropagation: e.stopPropagation,
      isPropagationStopped: () => false,
      isDefaultPrevented: () => false,
      persist: () => {}
    } as ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
  };

  return (
    <Box position="relative" width="100%">
      <Box
        as="select"
        name={name}
        value={value}
        onChange={handleChange as any}
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
        sx={{
          appearance: "none"
        }}
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
      </Box>
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
};
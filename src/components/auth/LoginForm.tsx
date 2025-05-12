// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  Container,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAppStore } from '../../store/appStore';

const MotionBox = motion(Box);

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const login = useAppStore(state => state.login);
  const authError = useAppStore(state => state.auth.error);
  const toast = useToast();

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setUsernameError('');
    setPasswordError('');
    
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Attempt login
    const success = login(username, password);
    
    setIsSubmitting(false);
    
    if (success) {
      toast({
        title: 'Login successful',
        description: `Welcome back!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Login failed',
        description: authError || 'Invalid username or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // For demo purposes, we'll add a helper to prefill test account credentials
  const fillTestAccount = (account: string) => {
    if (account === 'student') {
      setUsername('student');
      setPassword('password123');
    } else if (account === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  return (
    <Container maxW="container.xl" centerContent minH="100vh" py={12}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        w={{ base: '90%', md: '450px' }}
        bg="gray.800"
        p={8}
        borderRadius="xl"
        boxShadow="2xl"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading 
              as="h1" 
              size="xl" 
              mb={2}
              bgGradient="linear(to-r, brand.400, accent.500)" 
              bgClip="text"
            >
              ✨ StudyQuest ✨
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Track your learning, earn rewards
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!usernameError}>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
                <FormErrorMessage>{usernameError}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!passwordError}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      size="sm"
                      onClick={togglePasswordVisibility}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{passwordError}</FormErrorMessage>
              </FormControl>

              <Button
                colorScheme="brand"
                width="full"
                mt={4}
                type="submit"
                isLoading={isSubmitting}
              >
                Log In
              </Button>
            </VStack>
          </form>

          {/* Quick login for demo purposes */}
          <Box mt={6}>
            <Text textAlign="center" fontSize="sm" color="gray.500" mb={2}>
              Demo Accounts
            </Text>
            <Flex gap={4} justifyContent="center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fillTestAccount('student')}
              >
                Student
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fillTestAccount('admin')}
              >
                Admin
              </Button>
            </Flex>
          </Box>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default LoginForm;
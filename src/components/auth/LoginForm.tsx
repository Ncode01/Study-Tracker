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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAppStore } from '../../store/appStore';

const MotionBox = motion(Box);

export const LoginForm: React.FC = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Sign up state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupEmailError, setSignupEmailError] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  
  const [isFirebaseConfigured] = useState(true);
  
  const login = useAppStore(state => state.login);
  const signUp = useAppStore(state => state.signUp);
  const authError = useAppStore(state => state.auth.error);
  const isOnline = useAppStore(state => state.isOnline);
  const toast = useToast();

  // Validate login form
  const validateLoginForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email) && isFirebaseConfigured) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6 && isFirebaseConfigured) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  // Validate signup form
  const validateSignupForm = () => {
    let isValid = true;
    
    // Reset errors
    setSignupEmailError('');
    setSignupPasswordError('');
    setConfirmPasswordError('');
    setDisplayNameError('');
    
    if (!signupEmail.trim()) {
      setSignupEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      setSignupEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (!signupPassword) {
      setSignupPasswordError('Password is required');
      isValid = false;
    } else if (signupPassword.length < 6) {
      setSignupPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    if (signupPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    if (!displayName.trim()) {
      setDisplayNameError('Display name is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Attempt login
      const success = await login(email, password);
      
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
          description: authError || 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) return;
    
    setIsSigningUp(true);
    
    try {
      // Attempt signup
      const success = await signUp(signupEmail, signupPassword, displayName);
      
      if (success) {
        toast({
          title: 'Account created',
          description: `Welcome to StudyQuest, ${displayName}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Signup failed',
          description: authError || 'Could not create account',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword(!showSignupPassword);
  };

  // For demo purposes, we'll add a helper to prefill test account credentials
  const fillTestAccount = (account: string) => {
    if (account === 'student') {
      setEmail('student@example.com');
      setPassword('password123');
    } else if (account === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    }
  };

  // Show an offline indicator if needed
  const connectivityStatus = () => {
    if (!isOnline) {
      return (
        <Box mt={3} p={2} bg="orange.700" borderRadius="md" textAlign="center">
          <Text fontSize="sm">
            You are currently offline. Limited functionality is available.
          </Text>
        </Box>
      );
    }
    return null;
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

          {connectivityStatus()}

          <Tabs isFitted variant="enclosed" colorScheme="brand">
            <TabList mb="1em">
              <Tab><FaSignInAlt style={{ marginRight: '8px' }} /> Login</Tab>
              <Tab><FaUserPlus style={{ marginRight: '8px' }} /> Sign Up</Tab>
            </TabList>
            <TabPanels>
              {/* Login Panel */}
              <TabPanel>
                <form onSubmit={handleLogin}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!emailError}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                      <FormErrorMessage>{emailError}</FormErrorMessage>
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
                      loadingText="Logging in"
                    >
                      Log In
                    </Button>
                  </VStack>
                </form>

                {/* Demo Accounts */}
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
              </TabPanel>

              {/* Sign Up Panel */}
              <TabPanel>
                <form onSubmit={handleSignUp}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!displayNameError}>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your name"
                      />
                      <FormErrorMessage>{displayNameError}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!signupEmailError}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                      <FormErrorMessage>{signupEmailError}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!signupPasswordError}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create a password"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                            icon={showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                            variant="ghost"
                            size="sm"
                            onClick={toggleSignupPasswordVisibility}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{signupPasswordError}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!confirmPasswordError}>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                      />
                      <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
                    </FormControl>

                    <Button
                      colorScheme="accent"
                      width="full"
                      mt={4}
                      type="submit"
                      isLoading={isSigningUp}
                      loadingText="Creating Account"
                      isDisabled={!isOnline || !isFirebaseConfigured}
                    >
                      Create Account
                    </Button>
                    
                    {!isOnline && (
                      <Text fontSize="sm" color="orange.300" textAlign="center">
                        Sign up requires an internet connection
                      </Text>
                    )}
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default LoginForm;
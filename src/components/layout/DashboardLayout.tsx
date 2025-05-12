// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  HStack, 
  VStack,
  Grid, 
  GridItem,
  Button,
  Icon,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Flex
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMoon, FaSun, FaClipboardCheck, FaBook, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { TaskList } from '../tasks/TaskList';
import { TaskForm } from '../tasks/TaskForm';
import { SubjectList } from '../subjects/SubjectList';
import { SubjectForm } from '../subjects/SubjectForm';
import { StudyTimer } from '../timer/StudyTimer';
import { PointsDisplay } from '../common/PointsDisplay';
import { useAppStore } from '../../store/appStore';

const MotionBox = motion(Box as any);

export const DashboardLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const currentUser = useAppStore(state => state.auth.currentUser);
  const logout = useAppStore(state => state.logout);
  
  const bgGradient = isDarkMode
    ? 'linear(to-br, gray.900, blue.900)'
    : 'linear(to-br, gray.50, blue.50)';
  const cardBg = isDarkMode ? 'gray.800' : 'white';

  const handleSubjectSelect = (subjectId: string | null) => {
    setSelectedSubjectId(subjectId);
  };

  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      py={8}
    >
      <Container maxW="container.xl">
        <VStack gap={8} align="stretch">
          <HStack justifyContent="space-between" alignItems="center">
            <MotionBox
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Heading 
                as="h1" 
                size="2xl" 
                bgGradient="linear(to-r, brand.400, accent.500)" 
                bgClip="text"
              >
                ✨ StudyQuest ✨
              </Heading>
              <Text color="gray.500">Track your learning, earn rewards</Text>
            </MotionBox>
            
            <HStack spacing={4}>
              <PointsDisplay />
              <Button onClick={toggleColorMode} variant="ghost" size="md">
                <Icon as={isDarkMode ? FaSun : FaMoon} />
              </Button>
              
              {/* User menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Flex align="center">
                    <Avatar
                      size={'sm'}
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username || 'User'}`}
                      mr={2}
                    />
                    <Text display={{ base: 'none', md: 'block' }}>
                      {currentUser?.displayName || 'User'}
                    </Text>
                  </Flex>
                </MenuButton>
                <MenuList bg={cardBg}>
                  <MenuItem icon={<FaUser />}>Profile</MenuItem>
                  <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          <Grid 
            templateColumns={{ base: "1fr", lg: "300px 1fr" }}
            gap={6}
          >
            {/* Subjects Column */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                h="100%"
              >
                <HStack mb={4}>
                  <Icon as={FaBook} color="brand.500" />
                  <Heading size="md">My Subjects</Heading>
                </HStack>
                <SubjectForm />
                <Box my={4} height="1px" bg="gray.600" />
                <SubjectList onSelectSubject={handleSubjectSelect} />
              </MotionBox>
            </GridItem>
            
            {/* Tasks Column */}
            <GridItem>
              <VStack gap={6} align="stretch">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="lg"
                >
                  <HStack mb={4}>
                    <Icon as={FaClipboardCheck} color="brand.500" />
                    <Heading size="md">
                      {selectedSubjectId ? 'Subject Tasks' : 'All Tasks'}
                    </Heading>
                    {selectedSubjectId && (
                      <Button 
                        size="xs" 
                        onClick={() => setSelectedSubjectId(null)}
                        variant="outline"
                        ml={2}
                      >
                        Show All
                      </Button>
                    )}
                  </HStack>
                  <TaskForm />
                  <TaskList subjectId={selectedSubjectId || undefined} />
                </MotionBox>
                
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="lg"
                >
                  <StudyTimer />
                </MotionBox>
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};
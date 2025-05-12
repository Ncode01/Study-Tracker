// src/components/layout/DashboardLayout.tsx
import React, { useState, useRef } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  HStack, 
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
  Flex,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMoon, FaSun, FaClipboardCheck, FaBook, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { TaskList } from '../tasks/TaskList';
import { TaskForm } from '../tasks/TaskForm';
import { SubjectList } from '../subjects/SubjectList';
import { SubjectForm } from '../subjects/SubjectForm';
import { StudyTimer } from '../timer/StudyTimer';
import { HistoryView } from '../history/HistoryView';
import { PointsDisplay } from '../common/PointsDisplay';
import { FloatingActionButton } from '../common/FloatingActionButton';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { Sidebar } from '../navigation/Sidebar';
import { useAppStore } from '../../store/appStore';
import { useNavStore } from '../../store/navStore';

const MotionBox = motion(Box as any);

export const DashboardLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isOpen: isTaskFormOpen, onOpen: onTaskFormOpen, onClose: onTaskFormClose } = useDisclosure();
  const timerRef = useRef<HTMLDivElement>(null);
  
  const currentUser = useAppStore(state => state.auth.currentUser);
  const logout = useAppStore(state => state.logout);
  const activeTab = useNavStore(state => state.activeTab);
  
  const bgGradient = isDarkMode
    ? 'linear(to-br, gray.900, blue.900)'
    : 'linear(to-br, gray.50, blue.50)';
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubjectSelect = (subjectId: string | null) => {
    setSelectedSubjectId(subjectId);
  };

  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const startTimer = () => {
    if (timerRef.current) {
      timerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
    >
      {/* Sidebar (desktop only) */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <Box
        ml={{ base: 0, lg: isSidebarCollapsed ? "80px" : "250px" }}
        transition="margin 0.2s"
        pt={{ base: 4, lg: 6 }}
        pb={{ base: 20, lg: 6 }}
        px={{ base: 4, lg: 8 }}
      >
        {/* Top navigation for mobile */}
        <Flex 
          display={{ base: 'flex', lg: 'none' }}
          justifyContent="space-between" 
          alignItems="center"
          mb={6}
        >
          <Heading
            as="h1"
            size="lg"
            bgGradient="linear(to-r, brand.400, accent.500)"
            bgClip="text"
          >
            ✨ StudyQuest
          </Heading>
          
          <HStack>
            <PointsDisplay />
            <Button onClick={toggleColorMode} variant="ghost" size="sm">
              <Icon as={isDarkMode ? FaSun : FaMoon} />
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar 
                  size="sm" 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username || 'User'}`} 
                />
              </MenuButton>
              <MenuList bg={cardBg}>
                <MenuItem icon={<FaUser />}>Profile</MenuItem>
                <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Desktop Header */}
        <Flex 
          display={{ base: 'none', lg: 'flex' }} 
          justifyContent="space-between" 
          alignItems="center"
          mb={8}
        >
          <Heading size="lg" color="gray.200">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'timer' && 'Study Timer'}
            {activeTab === 'history' && 'Study History'}
            {activeTab === 'profile' && 'User Profile'}
          </Heading>
          
          <HStack>
            <Button onClick={toggleColorMode} variant="ghost" size="md">
              <Icon as={isDarkMode ? FaSun : FaMoon} />
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Flex align="center">
                  <Avatar
                    size="sm"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username || 'User'}`}
                    mr={2}
                  />
                  <Text display={{ base: 'none', md: 'block' }} color="gray.200">
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
        </Flex>
        
        {/* Main Content based on active tab */}
        <Container maxW="container.xl" px={{ base: 0, md: 4 }}>
          {activeTab === 'dashboard' && (
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
                  <TaskForm isOpen={isTaskFormOpen} onClose={onTaskFormClose} />
                  <TaskList subjectId={selectedSubjectId || undefined} />
                </MotionBox>
              </GridItem>
            </Grid>
          )}
          
          {activeTab === 'timer' && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              ref={timerRef}
            >
              <StudyTimer />
            </MotionBox>
          )}
          
          {activeTab === 'history' && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HistoryView />
            </MotionBox>
          )}
          
          {activeTab === 'profile' && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              bg={cardBg}
              p={6}
              borderRadius="xl"
              boxShadow="lg"
            >
              <Heading size="md" mb={4}>User Profile</Heading>
              <Text color="gray.500">Profile view will be implemented soon.</Text>
            </MotionBox>
          )}
        </Container>
      </Box>
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        onAddTask={onTaskFormOpen}
        onStartTimer={startTimer}
      />
      
      {/* Bottom Navigation (mobile only) */}
      <BottomNavigation />
    </Box>
  );
};
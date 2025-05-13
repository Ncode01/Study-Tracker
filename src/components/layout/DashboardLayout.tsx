// src/components/layout/DashboardLayout.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Heading, 
  HStack, 
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
import { 
  BentoGrid, 
  BentoItem, 
  GlassmorphicPanel, 
  ElasticScroll, 
  SpatialTransition, 
  BreathingAnimation 
} from '../ui';
import { useAdaptiveTheme } from '../../styles/emotionalDesign';
import { useContextualCursor } from '../../styles/cursorEffects';

export const DashboardLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen: isTaskFormOpen, onOpen: onTaskFormOpen, onClose: onTaskFormClose } = useDisclosure();
  const timerRef = useRef<HTMLDivElement>(null);
  
  const currentUser = useAppStore(state => state.auth.currentUser);
  const logout = useAppStore(state => state.logout);
  const activeTab = useNavStore(state => state.activeTab);
  
  // For demonstration purposes, using default values instead of accessing non-existent properties
  const studyDuration = 25; // Mock study duration in minutes
  const studyStreak = 3;    // Mock study streak in days
  
  // Apply dynamic mood-based theme
  const { mood, palette } = useAdaptiveTheme(
    studyDuration, 
    studyStreak,
    false // recentBreak
  );
  
  // Enhance UI with contextual cursor effects
  useContextualCursor(mood);
  
  const bgGradient = isDarkMode
    ? 'linear(to-br, gray.900, blue.900)'
    : 'linear(to-br, gray.50, blue.50)';
  const cardBg = useColorModeValue('white', 'gray.800');

  // Simulate loading for breathing animation demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // Define bento areas for dashboard grid layout
  const dashboardAreas = [
    { id: 'subjects', rowSpan: 1, colSpan: 4, priority: 1 },
    { id: 'tasks', rowSpan: 1, colSpan: 8, priority: 2 },
    { id: 'stats', rowSpan: 1, colSpan: 4, priority: 3 },
    { id: 'progress', rowSpan: 1, colSpan: 4, priority: 4 },
    { id: 'tips', rowSpan: 1, colSpan: 4, priority: 5 },
  ];

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
            bgGradient={`linear(to-r, ${palette.primary}, ${palette.accent})`}
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
            {isLoading && <BreathingAnimation mood={mood} size="30px" mr={2} />}
            <PointsDisplay />
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
            <SpatialTransition isActive={activeTab === 'dashboard'} mood={mood}>
              {/* Modern Bento Grid Layout for Dashboard */}
              <BentoGrid 
                areas={dashboardAreas} 
                gap={6} 
                mood={mood}
                staggerAnimation={true}
              >
                {/* Subjects Item */}
                <BentoItem mood={mood} glassmorphic={true} hoverEffect="glow">
                  <HStack mb={4}>
                    <Icon as={FaBook} color={palette.accent} />
                    <Heading size="md">My Subjects</Heading>
                  </HStack>
                  <SubjectForm />
                  <Box my={4} height="1px" bg="gray.600" />
                  <ElasticScroll maxHeight="300px" mood={mood}>
                    <SubjectList onSelectSubject={handleSubjectSelect} />
                  </ElasticScroll>
                </BentoItem>
                
                {/* Tasks Item */}
                <BentoItem mood={mood} glassmorphic={true} hoverEffect="lift">
                  <HStack mb={4}>
                    <Icon as={FaClipboardCheck} color={palette.accent} />
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
                  <ElasticScroll maxHeight="400px" mood={mood}>
                    <TaskList subjectId={selectedSubjectId || undefined} />
                  </ElasticScroll>
                </BentoItem>
                
                {/* Stats Card */}
                <BentoItem mood={mood} glassmorphic={true} hoverEffect="scale">
                  <Heading size="md" mb={3}>Study Stats</Heading>
                  <Text fontSize="sm" color="gray.500">Weekly study time: 12h 30m</Text>
                  <Text fontSize="sm" color="gray.500">Current streak: {studyStreak} days</Text>
                  <Text fontSize="sm" color="gray.500">Most productive: Monday</Text>
                </BentoItem>
                
                {/* Progress Card */}
                <BentoItem mood={mood} glassmorphic={true}>
                  <Heading size="md" mb={3}>Goals Progress</Heading>
                  <Text fontSize="sm" color="gray.500">3 of 5 goals completed this week</Text>
                </BentoItem>
                
                {/* Study Tips Card */}
                <BentoItem mood={mood} glassmorphic={true}>
                  <Heading size="md" mb={3}>Quick Tips</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.
                  </Text>
                </BentoItem>
              </BentoGrid>
            </SpatialTransition>
          )}
          
          {activeTab === 'timer' && (
            <SpatialTransition isActive={activeTab === 'timer'} mood={mood}>
              <Box ref={timerRef}>
                <GlassmorphicPanel mood={mood}>
                  <StudyTimer />
                </GlassmorphicPanel>
              </Box>
            </SpatialTransition>
          )}
          
          {activeTab === 'history' && (
            <SpatialTransition isActive={activeTab === 'history'} mood={mood}>
              <HistoryView />
            </SpatialTransition>
          )}
          
          {activeTab === 'profile' && (
            <SpatialTransition isActive={activeTab === 'profile'} mood={mood}>
              <GlassmorphicPanel mood={mood}>
                <Heading size="md" mb={4}>User Profile</Heading>
                <Text color="gray.500">Profile view will be implemented soon.</Text>
              </GlassmorphicPanel>
            </SpatialTransition>
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
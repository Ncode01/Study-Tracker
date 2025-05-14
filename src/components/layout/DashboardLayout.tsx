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
  useDisclosure,
  Badge
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
import { Calendar } from '../calendar/Calendar';
import { useAppStore } from '../../store/appStore';
import { useNavStore } from '../../store/navStore';
import { 
  BentoGrid, 
  BentoItem, 
  GlassmorphicPanel, 
  ElasticScroll, 
  SpatialTransition, 
  BreathingAnimation,
  ThreeDProgressRing
} from '../ui';
import { motion } from 'framer-motion';
import { useAdaptiveTheme } from '../../styles/emotionalDesign';
import { useContextualCursor } from '../../styles/cursorEffects';

// Define MotionBox component
const MotionBox = motion(Box);

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
    { id: 'stats', rowSpan: 1, colSpan: 6, priority: 3 },
    { id: 'progress', rowSpan: 1, colSpan: 6, priority: 4 },
  ];

  // Stats data for visualization
  const studyStatsByCat = [
    { category: 'Math', hours: 8.5, color: '#FF5252' },
    { category: 'Programming', hours: 12, color: '#42A5F5' },
    { category: 'Physics', hours: 5.5, color: '#FFB300' },
    { category: 'Literature', hours: 3, color: '#9CCC65' },
  ];

  // Progress data for visualization
  const goalProgress = {
    total: 5,
    completed: 3,
    progress: 0.6
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
        >          <Heading size="lg" color="gray.200">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'timer' && 'Study Timer'}
            {activeTab === 'history' && 'Study History'}
            {activeTab === 'calendar' && 'Calendar'}
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
                
                {/* Stats Card with interactive visualization */}
                <BentoItem mood={mood} glassmorphic={true} hoverEffect="scale">
                  <Heading size="md" mb={4}>Study Stats</Heading>
                  
                  <Box position="relative" height="200px">
                    {/* Interactive 3D visualization of study time by category */}
                    <ThreeDProgressRing progress={0.75} mood={mood} size={200} />
                    
                    <Flex 
                      position="absolute" 
                      top="50%" 
                      left="50%" 
                      transform="translate(-50%, -50%)" 
                      direction="column" 
                      align="center"
                    >
                      <Text fontSize="2xl" fontWeight="bold">{studyStreak}</Text>
                      <Text fontSize="sm" color={palette.accent}>Day Streak</Text>
                    </Flex>
                  </Box>
                  
                  <Box mt={4}>
                    {studyStatsByCat.map((stat, index) => (
                      <Flex key={index} align="center" mb={2}>
                        <Box 
                          w="12px" 
                          h="12px" 
                          borderRadius="full" 
                          bg={stat.color} 
                          mr={2} 
                          boxShadow={`0 0 8px ${stat.color}80`}
                        />
                        <Text fontSize="sm" flex="1">{stat.category}</Text>
                        <Text fontSize="sm" fontWeight="bold">{stat.hours}h</Text>
                      </Flex>
                    ))}
                  </Box>
                </BentoItem>
                
                {/* Goal Progress with liquid animation */}
                <BentoItem mood={mood} glassmorphic={true} hoverEffect="glow">
                  <Heading size="md" mb={4}>Goals Progress</Heading>
                  
                  {/* Liquid progress bar */}
                  <Box 
                    position="relative" 
                    height="30px" 
                    bg="rgba(0,0,0,0.2)" 
                    borderRadius="full" 
                    overflow="hidden"
                    mb={4}
                    sx={{
                      "@keyframes wave": {
                        "0%": { backgroundPositionX: "0%" },
                        "100%": { backgroundPositionX: "100%" }
                      }
                    }}
                  >
                    <MotionBox
                      position="absolute"
                      top="0"
                      left="0"
                      height="100%"
                      width={`${goalProgress.progress * 100}%`}
                      borderRadius="full"
                      bgGradient={`linear(to-r, ${palette.primary}, ${palette.accent})`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${goalProgress.progress * 100}%`,
                        transition: { duration: 1.5, ease: "easeOut" }
                      }}
                      // Liquid wave effect
                      _after={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.2' d='M0,192L60,208C120,224,240,256,360,250.7C480,245,600,203,720,197.3C840,192,960,224,1080,224C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x`,
                        backgroundSize: '100% 100%',
                        animation: 'wave 8s linear infinite',
                      }}
                    />
                    
                    {/* Percentage text overlay */}
                    <Flex 
                      position="absolute" 
                      top="0" 
                      left="0" 
                      right="0" 
                      bottom="0" 
                      align="center" 
                      justify="center"
                    >
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold"
                        color="white"
                        textShadow="0 0 4px rgba(0,0,0,0.5)"
                      >
                        {Math.round(goalProgress.progress * 100)}%
                      </Text>
                    </Flex>
                  </Box>
                  
                  {/* Goal stats and details */}
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Completed Goals</Text>
                    <Text fontSize="sm" fontWeight="bold">{goalProgress.completed} of {goalProgress.total}</Text>
                  </HStack>
                  
                  {/* Goal list */}
                  <Box mt={4} pl={2}>
                    <Flex align="center" mb={2}>
                      <Box 
                        w="10px" 
                        h="10px" 
                        borderRadius="full" 
                        bg="green.400" 
                        mr={2} 
                      />
                      <Text fontSize="sm" flex="1">Complete Math Assignment</Text>
                      <Badge colorScheme="green">Done</Badge>
                    </Flex>
                    
                    <Flex align="center" mb={2}>
                      <Box 
                        w="10px" 
                        h="10px" 
                        borderRadius="full" 
                        bg="green.400" 
                        mr={2} 
                      />
                      <Text fontSize="sm" flex="1">Study for History Test</Text>
                      <Badge colorScheme="green">Done</Badge>
                    </Flex>
                    
                    <Flex align="center" mb={2}>
                      <Box 
                        w="10px" 
                        h="10px" 
                        borderRadius="full" 
                        bg="green.400" 
                        mr={2} 
                      />
                      <Text fontSize="sm" flex="1">Read Chapter 5</Text>
                      <Badge colorScheme="green">Done</Badge>
                    </Flex>
                    
                    <Flex align="center" mb={2}>
                      <Box 
                        w="10px" 
                        h="10px" 
                        borderRadius="full" 
                        bg="gray.500" 
                        mr={2} 
                      />
                      <Text fontSize="sm" flex="1">Write Research Paper</Text>
                      <Badge colorScheme="gray">Pending</Badge>
                    </Flex>
                    
                    <Flex align="center">
                      <Box 
                        w="10px" 
                        h="10px" 
                        borderRadius="full" 
                        bg="gray.500" 
                        mr={2} 
                      />
                      <Text fontSize="sm" flex="1">Review Project Code</Text>
                      <Badge colorScheme="gray">Pending</Badge>
                    </Flex>
                  </Box>
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
          )}            {activeTab === 'history' && (
            <SpatialTransition isActive={activeTab === 'history'} mood={mood}>
              <HistoryView />
            </SpatialTransition>
          )}          {activeTab === 'calendar' && (
            <SpatialTransition isActive={activeTab === 'calendar'} mood={mood}>
              <GlassmorphicPanel mood={mood} maxH="calc(100vh - 140px)" overflowY="hidden">
                <Calendar />
              </GlassmorphicPanel>
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
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
  Grid,
  GridItem,
  useColorModeValue,
  useDisclosure,
  Badge,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaClipboardCheck, 
  FaBook, 
  FaSignOutAlt, 
  FaUser, 
  FaCalendarAlt,
  FaChartLine,
  FaTasks,
  FaUserGraduate
} from 'react-icons/fa';
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
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
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Stats data for visualization
  const studyStatsByCat = [
    { category: 'Math', hours: 8.5, color: '#FF5252', percentage: 40 },
    { category: 'Programming', hours: 12, color: '#42A5F5', percentage: 20 },
    { category: 'Physics', hours: 5.5, color: '#FFB300', percentage: 30 },
    { category: 'Literature', hours: 3, color: '#9CCC65', percentage: 10 },
  ];

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, user: 'You', action: 'Completed Physics homework', timestamp: '10:45 AM', subject: 'Physics' },
    { id: 2, user: 'You', action: 'Started Math practice', timestamp: '9:30 AM', subject: 'Math' },
    { id: 3, user: 'You', action: 'Added new task', timestamp: '8:15 AM', subject: 'Programming' },
  ];

  // Mock study metrics
  const studyMetrics = {
    studyHours: { current: 25.5, change: 8.2, direction: 'increase' },
    tasksCompleted: { current: 18, change: 5, direction: 'increase' },
  };

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const daysInMonth = getDaysInMonth(year, currentMonth.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(year, currentMonth.getMonth());
  
  // Mock data for hours studied on specific days
  const studyDays = [2, 5, 8, 9, 12, 15, 18, 19, 23, 26, 29];
  
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
              {/* Updated layout inspired by medical dashboard */}
              <Grid
                templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }}
                gap={6}
              >
                {/* Top row - Key metrics */}
                <GridItem colSpan={{ base: 1, lg: 3 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="lift">
                    <HStack align="flex-start">
                      <MotionBox 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Icon as={FaUserGraduate} color={palette.accent} boxSize={6} />
                      </MotionBox>
                      <Stat>
                        <StatLabel>Study Sessions</StatLabel>
                        <StatNumber>{studyStreak}</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          Day Streak
                        </StatHelpText>
                      </Stat>
                    </HStack>
                  </BentoItem>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, lg: 3 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="lift">
                    <HStack align="flex-start">
                      <Icon as={FaChartLine} color={palette.accent} boxSize={6} />
                      <Stat>
                        <StatLabel>Total Study Time</StatLabel>
                        <StatNumber>{studyMetrics.studyHours.current}h</StatNumber>
                        <StatHelpText>
                          <StatArrow type={studyMetrics.studyHours.direction as any} />
                          {studyMetrics.studyHours.change}h
                        </StatHelpText>
                      </Stat>
                    </HStack>
                  </BentoItem>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, lg: 3 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="lift">
                    <HStack align="flex-start">
                      <Icon as={FaTasks} color={palette.accent} boxSize={6} />
                      <Stat>
                        <StatLabel>Tasks Completed</StatLabel>
                        <StatNumber>{studyMetrics.tasksCompleted.current}</StatNumber>
                        <StatHelpText>
                          <StatArrow type={studyMetrics.tasksCompleted.direction as any} />
                          {studyMetrics.tasksCompleted.change}
                        </StatHelpText>
                      </Stat>
                    </HStack>
                  </BentoItem>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, lg: 3 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="lift">
                    <HStack align="flex-start">
                      <Icon as={FaClipboardCheck} color={palette.accent} boxSize={6} />
                      <Stat>
                        <StatLabel>Completion Rate</StatLabel>
                        <StatNumber>{goalProgress.progress * 100}%</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          {goalProgress.completed} of {goalProgress.total}
                        </StatHelpText>
                      </Stat>
                    </HStack>
                  </BentoItem>
                </GridItem>
                
                {/* Middle row - Calendar & Tasks */}
                <GridItem colSpan={{ base: 1, lg: 5 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="glow" h="100%">
                    <Flex justify="space-between" align="center" mb={4}>
                      <Icon as={FaCalendarAlt} color={palette.accent} />
                      <Heading size="md">{monthName} {year}</Heading>
                      <HStack>
                        <Button size="sm" onClick={handlePrevMonth} variant="ghost">
                          &lt;
                        </Button>
                        <Button size="sm" onClick={handleNextMonth} variant="ghost">
                          &gt;
                        </Button>
                      </HStack>
                    </Flex>
                    
                    <Grid templateColumns="repeat(7, 1fr)" gap={2}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <GridItem key={day} textAlign="center">
                          <Text fontSize="xs" fontWeight="bold">{day}</Text>
                        </GridItem>
                      ))}
                      
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <GridItem key={`empty-${i}`} />
                      ))}
                      
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isStudyDay = studyDays.includes(day);
                        return (
                          <GridItem key={`day-${day}`} textAlign="center">
                            <Box
                              w="30px"
                              h="30px"
                              lineHeight="30px"
                              borderRadius="full"
                              mx="auto"
                              bg={isStudyDay ? `${palette.accent}40` : 'transparent'}
                              color={isStudyDay ? 'white' : 'inherit'}
                            >
                              {day}
                            </Box>
                          </GridItem>
                        );
                      })}
                    </Grid>
                    
                    <Box mt={6} mb={2}>
                      <Heading size="sm" mb={2}>Study Stats</Heading>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm">Last 7 days</Text>
                        <Badge colorScheme="green">+8%</Badge>
                      </Flex>
                    </Box>
                  </BentoItem>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, lg: 7 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="lift" h="100%">
                    <HStack mb={4} justify="space-between">
                      <Flex align="center">
                        <Icon as={FaClipboardCheck} color={palette.accent} mr={2} />
                        <Heading size="md">
                          {selectedSubjectId ? 'Subject Tasks' : 'All Tasks'}
                        </Heading>
                      </Flex>
                      <Button 
                        size="sm" 
                        onClick={onTaskFormOpen} 
                        variant="solid"
                        colorScheme="blue"
                      >
                        Add Task
                      </Button>
                    </HStack>
                    <TaskForm isOpen={isTaskFormOpen} onClose={onTaskFormClose} />
                    <ElasticScroll maxHeight="350px" mood={mood}>
                      <TaskList subjectId={selectedSubjectId || undefined} />
                    </ElasticScroll>
                  </BentoItem>
                </GridItem>
                
                {/* Bottom row - Subjects & Distribution */}
                <GridItem colSpan={{ base: 1, lg: 4 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="glow" h="100%">
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
                </GridItem>
                
                <GridItem colSpan={{ base: 1, lg: 4 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="scale" h="100%">
                    <Heading size="md" mb={4}>Study Distribution</Heading>
                    
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
                        <Text fontSize="sm" color={palette.accent}>Hours</Text>
                        <Text fontSize="2xl" fontWeight="bold">{studyStatsByCat.reduce((acc, s) => acc + s.hours, 0)}</Text>
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
                          <Text fontSize="sm" fontWeight="bold">{stat.percentage}%</Text>
                        </Flex>
                      ))}
                    </Box>
                  </BentoItem>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, lg: 4 }}>
                  <BentoItem mood={mood} glassmorphic={true} hoverEffect="glow" h="100%">
                    <Heading size="md" mb={4}>Recent Activity</Heading>
                    
                    <VStack spacing={4} align="stretch">
                      {recentActivity.map((activity) => (
                        <HStack key={activity.id} spacing={3}>
                          <Avatar 
                            size="sm" 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.username || 'User'}`} 
                          />
                          <Box flex="1">
                            <Text fontWeight="medium">{activity.action}</Text>
                            <HStack>
                              <Text fontSize="xs" color="gray.500">{activity.timestamp}</Text>
                              <Badge colorScheme="blue" variant="subtle">{activity.subject}</Badge>
                            </HStack>
                          </Box>
                        </HStack>
                      ))}
                    </VStack>
                    
                    <Button size="sm" variant="link" colorScheme="blue" mt={4} alignSelf="flex-end">
                      View All Activity
                    </Button>
                  </BentoItem>
                </GridItem>
              </Grid>
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
import { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginForm } from './components/auth';
import { useAppStore } from './store/appStore';
import { Analytics } from '@vercel/analytics/react';
import { useAdaptiveTheme } from './styles/emotionalDesign';
import { createAdaptiveTheme } from './styles/theme';

function App() {
  const isAuthenticated = useAppStore(state => state.auth.isAuthenticated);
  const streakData = useAppStore(state => state.streakData);
  const sessions = useAppStore(state => state.loggedSessions);
  
  // Get the most recent session duration for adaptive theming
  const [recentSessionDuration, setRecentSessionDuration] = useState(0);
  
  // Determine if user recently took a break (within last hour)
  const [recentBreak, setRecentBreak] = useState(false);
  
  // Update session metrics for adaptive theming
  useEffect(() => {
    if (sessions.length > 0) {
      // Sort sessions by end time (most recent first)
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
      );
      
      const mostRecentSession = sortedSessions[0];
      const sessionEndTime = new Date(mostRecentSession.endTime).getTime();
      const currentTime = new Date().getTime();
      const hourInMillis = 60 * 60 * 1000;
      
      // If session ended in the last hour
      if (currentTime - sessionEndTime < hourInMillis) {
        setRecentSessionDuration(mostRecentSession.durationMinutes);
        
        // Determine if the user recently took a break (session > 45 min)
        if (mostRecentSession.durationMinutes > 45) {
          setRecentBreak(true);
        }
      } else {
        setRecentSessionDuration(0);
        setRecentBreak(false);
      }
    }
  }, [sessions]);
  
  // Get the adaptive theme based on user behavior
  const { mood } = useAdaptiveTheme(
    recentSessionDuration,
    streakData?.currentStreak || 0,
    recentBreak
  );
  
  // Create a dynamic theme based on the current mood
  const dynamicTheme = createAdaptiveTheme(mood);

  return (
    <ChakraProvider theme={dynamicTheme}>
      {isAuthenticated ? <DashboardLayout /> : <LoginForm />}
      <Analytics />
    </ChakraProvider>
  );
}

export default App;
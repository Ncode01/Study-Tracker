// src/styles/emotionalDesign.ts
import { useState, useEffect } from 'react';

// Mood-based color palette definitions
export const moodPalettes = {
  focus: {
    primary: '#3182CE', // Blue for focus
    secondary: '#63B3ED',
    accent: '#4FD1C5',
    background: 'linear-gradient(to bottom right, #2A4365, #1A365D)',
    text: '#F7FAFC',
    name: 'Focus Mode'
  },
  relax: {
    primary: '#38A169', // Green for relaxation
    secondary: '#68D391',
    accent: '#9AE6B4',
    background: 'linear-gradient(to bottom right, #22543D, #276749)',
    text: '#F0FFF4',
    name: 'Relaxation Mode'
  },
  energize: {
    primary: '#DD6B20', // Orange for energy
    secondary: '#ED8936', 
    accent: '#F6AD55',
    background: 'linear-gradient(to bottom right, #7B341E, #9C4221)',
    text: '#FFFAF0',
    name: 'Energy Boost'
  },
  celebrate: {
    primary: '#805AD5', // Purple for celebration
    secondary: '#B794F4',
    accent: '#FFC107', // Gold accent
    background: 'linear-gradient(to bottom right, #44337A, #553C9A)',
    text: '#FAF5FF',
    name: 'Celebration Mode'
  },
  night: {
    primary: '#1A202C', // Dark for night mode
    secondary: '#2D3748',
    accent: '#4A5568',
    background: 'linear-gradient(to bottom right, #171923, #0B0E11)',
    text: '#E2E8F0',
    name: 'Night Mode'
  }
};

export type MoodType = keyof typeof moodPalettes;

// Helper function to determine appropriate mood based on user activity
export const determineMood = (
  timeOfDay: number, // 0-23 for hour of day
  studyDuration: number, // in minutes
  consecutiveDays: number, // streak
  recentBreak: boolean // whether user recently took a break
): MoodType => {
  // Late night (10pm - 5am) - use night mode
  if (timeOfDay >= 22 || timeOfDay < 5) {
    return 'night';
  }
  
  // Celebration mood when user has good streak
  if (consecutiveDays > 5) {
    return 'celebrate';
  }
  
  // Relaxation mood after long study sessions or when taking a break
  if (studyDuration > 90 || recentBreak) {
    return 'relax';
  }
  
  // Energy boost for morning sessions (6am - 11am)
  if (timeOfDay >= 6 && timeOfDay < 12) {
    return 'energize';
  }
  
  // Default to focus mode
  return 'focus';
};

// Hook to handle adaptive theming
export const useAdaptiveTheme = (
  studyDuration: number = 0,
  consecutiveDays: number = 0,
  recentBreak: boolean = false
) => {
  const [currentMood, setCurrentMood] = useState<MoodType>('focus');
  
  useEffect(() => {
    const hour = new Date().getHours();
    const mood = determineMood(hour, studyDuration, consecutiveDays, recentBreak);
    setCurrentMood(mood);
  }, [studyDuration, consecutiveDays, recentBreak]);
  
  return {
    mood: currentMood,
    palette: moodPalettes[currentMood]
  };
};

// Generate empathetic messages based on user activity
export const generateEmpatheticMessage = (
  studyDuration: number,
  consecutiveDays: number,
  timeOfDay: number = new Date().getHours()
): string => {
  // Messages for different scenarios
  const messages = {
    milestone: [
      "You've reached a milestone! 🎉 Great work on maintaining focus.",
      "Fantastic progress! Your dedication is truly admirable. ✨",
      "Achievement unlocked: Focused Scholar! 🏆 Keep up the great work!"
    ],
    streak: [
      `Amazing! You've studied for ${consecutiveDays} days in a row. 🔥`,
      "Your consistency is building something special! 📈",
      `${consecutiveDays} day streak! You're building powerful habits. 💪`
    ],
    break: [
      "You've earned a break! 🧘‍♂️ Take a moment to refresh.",
      "Time to recharge those brain cells! 🔋 You've been working hard.",
      "Your mind needs rest to consolidate learning. Take 5! ☕"
    ],
    encouragement: [
      "Keep going, you're doing great! 👏",
      "Each minute of focus builds your knowledge foundation. 🏗️",
      "Small steps lead to big achievements. You've got this! 🌱"
    ],
    night: [
      "Night owl session in progress! 🦉 Remember to get some rest soon.",
      "Burning the midnight oil? Your dedication is impressive! 🌙",
      "Late night study vibes. Remember, good sleep helps memory consolidation! 😴"
    ]
  };
  
  // Select appropriate message type
  let messageType: keyof typeof messages;
  
  if (studyDuration >= 50) {
    messageType = 'break';
  } else if (consecutiveDays >= 3) {
    messageType = 'streak';
  } else if (studyDuration >= 25) {
    messageType = 'milestone';
  } else if (timeOfDay >= 22 || timeOfDay < 5) {
    messageType = 'night';
  } else {
    messageType = 'encouragement';
  }
  
  // Randomly select a message from the appropriate category
  const selectedMessages = messages[messageType];
  const randomIndex = Math.floor(Math.random() * selectedMessages.length);
  
  return selectedMessages[randomIndex];
};
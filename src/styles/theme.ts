import { extendTheme } from '@chakra-ui/react';
import type { ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { moodPalettes } from './emotionalDesign';
import type { MoodType } from './emotionalDesign';

// Create a function to generate theme based on mood
export const createAdaptiveTheme = (mood: MoodType = 'focus') => {
  const palette = moodPalettes[mood];
  
  const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  };

  return extendTheme({
    config,
    colors: {
      brand: {
        50: palette.accent + '20', // With transparency
        100: palette.accent + '40',
        200: palette.accent + '60',
        300: palette.accent + '80',
        400: palette.accent,
        500: palette.primary, // Primary brand color
        600: palette.primary + 'dd',
        700: palette.primary + 'bb',
        800: palette.primary + '99',
        900: palette.primary + '77',
      },
      accent: { 
        500: palette.accent,
      }
    },
    fonts: {
      heading: `'Montserrat', sans-serif`,
      body: `'Open Sans', sans-serif`,
    },
    styles: {
      global: (props: any) => ({
        body: {
          bg: mode('white', 'gray.800')(props),
          color: palette.text,
          transition: 'all 0.3s ease',
        },
        '.mood-gradient': {
          backgroundImage: palette.background,
        },
        '.mood-primary': {
          color: palette.primary,
        },
        '.mood-secondary': {
          color: palette.secondary,
        },
        '.mood-accent': {
          color: palette.accent,
        },
        '.clay-button': {
          bg: palette.primary,
          color: palette.text,
          borderRadius: '12px',
          padding: '12px 24px',
          boxShadow: `6px 6px 12px ${palette.primary}40, -6px -6px 12px ${palette.primary}20`,
          border: 'none',
          transition: 'all 0.2s ease',
          _hover: {
            transform: 'scale(1.03)',
          },
          _active: {
            transform: 'scale(0.98)',
            boxShadow: `4px 4px 8px ${palette.primary}60, -2px -2px 6px ${palette.primary}30`,
          }
        }
      }),
    },
    components: {
      Button: {
        variants: {
          clay: {
            bg: palette.primary,
            color: palette.text,
            borderRadius: '12px',
            p: '12px 24px',
            boxShadow: `6px 6px 12px ${palette.primary}40, -6px -6px 12px ${palette.primary}20`,
            border: 'none',
            transition: 'all 0.2s ease',
            _hover: {
              transform: 'scale(1.03)',
            },
            _active: {
              transform: 'scale(0.98)',
              boxShadow: `4px 4px 8px ${palette.primary}60, -2px -2px 6px ${palette.primary}30`,
            }
          },
          ghost: {
            color: palette.secondary,
            _hover: {
              bg: palette.secondary + '20',
            }
          }
        },
      },
      Card: {
        baseStyle: {
          container: {
            borderRadius: '16px',
            overflow: 'hidden',
            bg: mode('white', 'gray.700'),
            transition: 'all 0.3s ease',
            _hover: {
              transform: 'translateY(-4px)',
              boxShadow: 'xl',
            }
          }
        }
      }
    }
  });
};

// Export a default theme (focus mode)
const theme = createAdaptiveTheme('focus');
export default theme;
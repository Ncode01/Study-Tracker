// src/styles/theme.ts
import { defineConfig } from '@chakra-ui/react';

const theme = defineConfig({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff',
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff', // Primary brand color
      600: '#096dd9',
      700: '#0050b3',
      800: '#003a8c',
      900: '#002766',
    },
    accent: { // For gamified highlights
      500: '#FFD700', // Gold
    }
  },
  fonts: {
    heading: `'Montserrat', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  styles: {
    global: {
      'body': {
        bg: 'gray.800',
        color: 'whiteAlpha.900',
      }
    },
  },
});

export default theme;
import { ChakraProvider } from '@chakra-ui/react';
import theme from './styles/theme';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <DashboardLayout />
    </ChakraProvider>
  );
}

export default App;
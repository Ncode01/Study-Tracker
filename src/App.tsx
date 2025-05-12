import { createChakra } from '@chakra-ui/react';
import theme from './styles/theme';
import { DashboardLayout } from './components/layout/DashboardLayout';

const { ChakraProvider } = createChakra({ theme });

function App() {
  return (
    <ChakraProvider>
      <DashboardLayout />
    </ChakraProvider>
  );
}

export default App;

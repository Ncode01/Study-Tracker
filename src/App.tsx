import { ChakraProvider } from '@chakra-ui/react';
import theme from './styles/theme';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginForm } from './components/auth';
import { useAppStore } from './store/appStore';

function App() {
  const isAuthenticated = useAppStore(state => state.auth.isAuthenticated);
  
  return (
    <ChakraProvider theme={theme}>
      {isAuthenticated ? <DashboardLayout /> : <LoginForm />}
    </ChakraProvider>
  );
}

export default App;
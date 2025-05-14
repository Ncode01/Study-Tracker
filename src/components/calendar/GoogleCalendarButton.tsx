import { Button, Icon } from '@chakra-ui/react';
import { FaGoogle, FaSync } from 'react-icons/fa';

interface GoogleCalendarButtonProps {
  isAuthenticated: boolean;
  isSyncing: boolean;
  onLogin: () => Promise<void>;
  onSync: () => Promise<void>;
}

const GoogleCalendarButton = ({
  isAuthenticated,
  isSyncing,
  onLogin,
  onSync
}: GoogleCalendarButtonProps) => {
  if (isSyncing) {
    return (
      <Button
        size="sm"
        colorScheme="gray"
        isLoading
        loadingText="Syncing..."
        disabled
      >
        Syncing...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        size="sm"
        colorScheme="red"
        leftIcon={<Icon as={FaGoogle} />}
        onClick={onLogin}
      >
        Connect Google Calendar
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      colorScheme="blue"
      leftIcon={<Icon as={FaSync} />}
      onClick={onSync}
    >
      Sync with Google
    </Button>
  );
};

export default GoogleCalendarButton;
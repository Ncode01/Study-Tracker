import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  useColorModeValue
} from '@chakra-ui/react';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Event Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontWeight="bold">{event.title}</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;

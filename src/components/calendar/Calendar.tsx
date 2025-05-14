import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
  Box,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useCalendarStore } from '../../store/calendarStore';
import ClassFormModal from './ClassFormModal';
import ReminderFormModal from './ReminderFormModal';
import EventDetailsModal from './EventDetailsModal';
import type { DateSelectArg, EventClickArg } from '../../types';

export const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen: isClassFormOpen, onOpen: onClassFormOpen, onClose: onClassFormClose } = useDisclosure();
  const { isOpen: isReminderFormOpen, onOpen: onReminderFormOpen, onClose: onReminderFormClose } = useDisclosure();
  const { isOpen: isEventDetailsOpen, onOpen: onEventDetailsOpen, onClose: onEventDetailsClose } = useDisclosure();

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  
  // Get calendar data from calendarStore - remove unused variables
  const { events } = useCalendarStore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
    onReminderFormOpen();
  };

  const handleEventClick = (info: EventClickArg) => {
    const eventId = info.event.id;
    const event = events.find(e => e.id === eventId);

    if (event) {
      setSelectedEvent(event);
      onEventDetailsOpen();
    }
  };

  return (
    <Box p={4}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        p={0}
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="md"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            backgroundColor: event.color || event.backgroundColor,
            borderColor: event.borderColor,
            textColor: event.textColor,
          }))}
          dateClick={(info) => {
            // Fix type issue with the date
            setSelectedDate({ start: info.date, end: info.date, allDay: true } as DateSelectArg);
            onClassFormOpen();
          }}
          eventClick={handleEventClick}
          select={handleDateSelect}
          editable={true}
          droppable={true}
          selectable={true}
          dayMaxEvents={true}
          weekends={true}
          height="auto"
          aspectRatio={1.8}
        />
      </Box>

      {isClassFormOpen && (
        <ClassFormModal
          isOpen={isClassFormOpen}
          onClose={onClassFormClose}
          initialDate={selectedDate?.start || new Date()}
          subjects={[]} // Pass required subjects prop
        />
      )}

      {isReminderFormOpen && (
        <ReminderFormModal
          isOpen={isReminderFormOpen}
          onClose={onReminderFormClose}
          initialDate={selectedDate?.start || new Date()}
          subjects={[]} // Pass required subjects prop
        />
      )}

      {isEventDetailsOpen && selectedEvent && (
        <EventDetailsModal
          isOpen={isEventDetailsOpen}
          onClose={onEventDetailsClose}
          event={selectedEvent}
        />
      )}
    </Box>
  );
};

export default Calendar;
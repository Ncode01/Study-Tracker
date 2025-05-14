import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
  Box,
  useColorModeValue,
  useDisclosure,
  Button,
  Flex,
  Menu,  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Heading,
  Text,
} from '@chakra-ui/react';
import { FaPlus, FaCalendar, FaBell } from 'react-icons/fa';
import { useCalendarStore } from '../../store/calendarStore';
import { useAppStore } from '../../store/appStore';
import ClassFormModal from './ClassFormModal';
import ReminderFormModal from './ReminderFormModal';
import EventDetailsModal from './EventDetailsModal';
import type { DateSelectArg, EventClickArg } from '../../types';

export const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen: isClassFormOpen, onOpen: onClassFormOpen, onClose: onClassFormClose } = useDisclosure();
  const { isOpen: isReminderFormOpen, onOpen: onReminderFormOpen, onClose: onReminderFormClose } = useDisclosure();
  const { isOpen: isEventDetailsOpen, onOpen: onEventDetailsOpen, onClose: onEventDetailsClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  
  // Get calendar data from calendarStore
  const { events, classes, reminders } = useCalendarStore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const handleDateClick = (info: any) => {
    // Fix type issue with the date
    setSelectedDate({ start: info.date, end: info.date, allDay: true } as DateSelectArg);
    onClassFormOpen();
  };
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
    onReminderFormOpen();
  };
  
  const handleEventClick = (info: EventClickArg) => {
    const eventType = info.event.extendedProps?.type;
    const eventData = info.event.extendedProps?.data;
    
    if (eventData) {
      setSelectedEvent({
        ...eventData,
        type: eventType,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        allDay: info.event.allDay
      });
      onEventDetailsOpen();
    }
  };  return (
    <Box p={0}>
      <Flex mb={4} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="md" mb={1}>Study Calendar</Heading>
          <Text fontSize="sm" color="gray.500">
            Schedule classes, set reminders, and manage your study events
          </Text>
        </Box>
        <Menu>
          <MenuButton
            as={Button}
            colorScheme="blue"
            size="sm"
            rightIcon={<Icon as={FaPlus} />}
          >
            Add
          </MenuButton>
          <MenuList>
            <MenuItem 
              icon={<Icon as={FaCalendar} />} 
              onClick={() => {
                setSelectedDate({ start: new Date(), end: new Date(), allDay: true } as DateSelectArg);
                onClassFormOpen();
              }}
            >
              Class Schedule
            </MenuItem>
            <MenuItem 
              icon={<Icon as={FaBell} />} 
              onClick={() => {
                setSelectedDate({ start: new Date(), end: new Date(), allDay: true } as DateSelectArg);
                onReminderFormOpen();
              }}
            >
              Reminder
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Box
        bg={bgColor}
        borderRadius="lg"
        p={0}
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="md"
        height="calc(100vh - 220px)"
        minHeight="500px"      ><FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: isMobile 
              ? 'listWeek,dayGridMonth' 
              : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List'
          }}
          dayMaxEventRows={3}
          events={[
            // Regular events
            ...events.map(event => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              allDay: event.allDay,
              backgroundColor: event.color || event.backgroundColor || '#3182CE',
              borderColor: event.borderColor || '#2B6CB0',
              textColor: event.textColor || '#FFFFFF',
              extendedProps: { type: 'event', data: event }
            })),
            // Class events
            ...classes.flatMap(cls => {
              // Generate recurring events for each day of week
              if (!cls.daysOfWeek || cls.daysOfWeek.length === 0) {
                return [];
              }
              
              return cls.daysOfWeek.map(day => ({
                id: `class-${cls.id}-${day}`,
                title: cls.title,
                daysOfWeek: [day],
                startTime: cls.startTime,
                endTime: cls.endTime,
                startRecur: new Date(cls.startRecur),
                endRecur: cls.endRecur ? new Date(cls.endRecur) : undefined,
                backgroundColor: cls.color || '#3182CE',
                extendedProps: { type: 'class', data: cls }
              }));
            }),
            // Reminder events
            ...reminders.map(reminder => {
              const reminderDate = new Date(reminder.date);
              let reminderDateTime = new Date(reminderDate);
              
              // If time is specified, set it
              if (reminder.time) {
                const [hours, minutes] = reminder.time.split(':').map(Number);
                reminderDateTime.setHours(hours, minutes);
              }
              
              return {
                id: `reminder-${reminder.id}`,
                title: reminder.title,
                start: reminderDateTime,
                allDay: !reminder.time,
                backgroundColor: reminder.priority === 'high' ? '#E53E3E' : 
                                 reminder.priority === 'medium' ? '#DD6B20' : '#38A169',
                extendedProps: { type: 'reminder', data: reminder }
              };
            })
          ]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          select={handleDateSelect}
          editable={true}
          droppable={true}
          selectable={true}
          dayMaxEvents={true}          weekends={true}
          height="100%"
          aspectRatio={1.8}
          stickyHeaderDates={true}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '08:00',
            endTime: '18:00'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
        />
      </Box>

      {isClassFormOpen && (
        <ClassFormModal
          isOpen={isClassFormOpen}
          onClose={onClassFormClose}
          initialDate={selectedDate?.start || new Date()}
          subjects={useAppStore.getState().subjects || []}
        />
      )}

      {isReminderFormOpen && (
        <ReminderFormModal
          isOpen={isReminderFormOpen}
          onClose={onReminderFormClose}
          initialDate={selectedDate?.start || new Date()}
          subjects={useAppStore.getState().subjects || []}
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
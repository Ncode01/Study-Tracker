// src/store/calendarStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent, CalendarClass, CalendarReminder } from '../types';

interface CalendarState {
  events: CalendarEvent[];
  classes: CalendarClass[];
  reminders: CalendarReminder[];
  
  // Event Actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  
  // Class Actions
  addClass: (classData: Omit<CalendarClass, 'id'>) => void;
  updateClass: (classData: CalendarClass) => void;
  deleteClass: (classId: string) => void;
  
  // Reminder Actions
  addReminder: (reminder: Omit<CalendarReminder, 'id'>) => void;
  updateReminder: (reminder: CalendarReminder) => void;
  deleteReminder: (reminderId: string) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [
    {
      id: 'sample-event-1',
      title: 'Project Meeting',
      start: new Date(new Date().setHours(10, 0)),
      end: new Date(new Date().setHours(11, 30)),
      allDay: false,
      backgroundColor: '#4299E1',
      borderColor: '#3182CE',
      textColor: '#FFFFFF',
      description: 'Discuss project progress',
      location: 'Room 101',
      source: 'local',
      editable: true
    }
  ],
  classes: [
    {
      id: 'sample-class-1',
      title: 'Mathematics 101',
      startTime: '09:00',
      endTime: '10:30',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      startRecur: new Date(),
      location: 'Room 201',
      notes: 'Bring calculator',
      color: '#38A169',
      subjectId: 'subj-0' // Match to Mathematics subject
    },
    {
      id: 'sample-class-2',
      title: 'Programming Workshop',
      startTime: '13:00',
      endTime: '14:30',
      daysOfWeek: [2, 4], // Tuesday, Thursday
      startRecur: new Date(),
      location: 'Computer Lab',
      notes: 'Bring laptop',
      color: '#4299E1',
      subjectId: 'subj-1' // Match to Programming subject
    }
  ],
  reminders: [
    {
      id: 'sample-reminder-1',
      title: 'Submit Assignment',
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      time: '15:00',
      description: 'Physics lab report',
      priority: 'high',
      subjectId: 'subj-2' // Match to Physics subject
    },
    {
      id: 'sample-reminder-2',
      title: 'Read Chapter 5',
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      time: '10:00',
      description: 'Literature textbook',
      priority: 'medium',
      subjectId: 'subj-3' // Match to Literature subject
    }
  ],
  
  // Event Actions
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: uuidv4() } as CalendarEvent]
  })),
  
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    )
  })),
  
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter(event => event.id !== eventId)
  })),
  
  // Class Actions
  addClass: (classData) => set((state) => ({
    classes: [...state.classes, { ...classData, id: uuidv4() } as CalendarClass]
  })),
  
  updateClass: (updatedClass) => set((state) => ({
    classes: state.classes.map(cls => 
      cls.id === updatedClass.id ? updatedClass : cls
    )
  })),
  
  deleteClass: (classId) => set((state) => ({
    classes: state.classes.filter(cls => cls.id !== classId)
  })),
  
  // Reminder Actions
  addReminder: (reminder) => set((state) => ({
    reminders: [...state.reminders, { ...reminder, id: uuidv4() } as CalendarReminder]
  })),
  
  updateReminder: (updatedReminder) => set((state) => ({
    reminders: state.reminders.map(reminder => 
      reminder.id === updatedReminder.id ? updatedReminder : reminder
    )
  })),
  
  deleteReminder: (reminderId) => set((state) => ({
    reminders: state.reminders.filter(reminder => reminder.id !== reminderId)
  }))
}));
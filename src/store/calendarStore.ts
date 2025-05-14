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
  events: [],
  classes: [],
  reminders: [],
  
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
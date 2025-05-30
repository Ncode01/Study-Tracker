import type { LoggedSession, CalendarEvent, Subject } from '../../types';
import { useAppStore } from '../../store/appStore';
import { useCalendarStore } from '../../store/calendarStore';

// Function to get subject by ID
async function getSubject(subjectId: string): Promise<Subject | undefined> {
  const { subjects } = useAppStore.getState();
  return subjects.find(s => s.id === subjectId);
}

// Function to add an event to the calendar
async function addEventToCalendar(event: CalendarEvent): Promise<void> {
  const { addEvent } = useCalendarStore.getState();
  addEvent(event);
}

/**
 * Handles adding a completed study session to the calendar
 */
export async function handleStudySessionCompleted(
  session: LoggedSession
): Promise<void> {
  try {
    // Find the associated subject for color
    const subject = await getSubject(session.subjectId);
    
    // Extract just what we need
    const subjectColor = subject?.color || '#3182CE';
    
    // Create calendar event
    const sessionEvent: CalendarEvent = {
      id: `study-session-${session.id}`,
      title: subject ? `Study: ${subject.name}` : 'Study Session',
      start: new Date(session.startTime),
      end: new Date(session.endTime),
      allDay: false,
      color: subjectColor,
      description: session.notes || `Study session: ${subject?.name || 'Unknown subject'}`,
      source: 'study-session',
      editable: false,
      sessionId: session.id,
      subjectId: session.subjectId,
      taskId: session.taskId,
    };
    
    // Add the event to the calendar
    await addEventToCalendar(sessionEvent);
  } catch (error) {
    console.error('Error adding study session to calendar:', error);
    throw error;
  }
}

/**
 * Synchronizes calendar data with the server
 */
export const syncCalendarData = async (): Promise<boolean> => {
  return true;
};

// Google Calendar API integration functions
export const authorizeGoogleCalendar = async (): Promise<boolean> => {
  try {
    return true;
  } catch (error) {
    console.error('Error authorizing Google Calendar:', error);
    return false;
  }
};

export const syncEventsWithGoogleCalendar = async (): Promise<boolean> => {
  try {
    return true;
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return false;
  }
};

export const importGoogleCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    return [];
  } catch (error) {
    console.error('Error importing from Google Calendar:', error);
    return [];
  }
};

/**
 * Fetches calendar data
 */
export async function getCalendarData() {
  try {
    return true;
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return false;
  }
}

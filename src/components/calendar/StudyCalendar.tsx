/**
 * @fileoverview Study calendar component using react-big-calendar.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { SlotInfo, View } from 'react-big-calendar';
import withDragAndDropModule from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { CalendarEvent } from '../../types';
import { SUBJECT_COLORS } from '../../types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import styles from './StudyCalendar.module.css';

/**
 * Setup date-fns localizer
 */
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

/**
 * Create drag-and-drop calendar
 */
const withDragAndDrop =
  (
    withDragAndDropModule as typeof withDragAndDropModule & {
      default?: typeof withDragAndDropModule;
    }
  ).default ?? withDragAndDropModule;

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

/**
 * Study calendar props
 */
export interface StudyCalendarProps {
  /** Calendar events */
  events: CalendarEvent[];
  /** Event select handler */
  onSelectEvent: (event: CalendarEvent) => void;
  /** Slot select handler (for creating new sessions) */
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  /** Event drop handler (for drag-and-drop) */
  onEventDrop: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
  /** Event resize handler */
  onEventResize: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
}

/**
 * Custom event styling based on subject
 */
function eventStyleGetter(event: CalendarEvent): { style: React.CSSProperties } {
  const isExam = event.isExam;
  const color = SUBJECT_COLORS[event.subject];

  return {
    style: {
      backgroundColor: isExam ? color : `${color}20`,
      borderLeft: `3px solid ${color}`,
      color: isExam ? 'white' : color,
      fontWeight: isExam ? 600 : 500,
      borderRadius: '4px',
      padding: '2px 6px',
      fontSize: '0.85rem',
    },
  };
}

/**
 * Study calendar component
 * @param props - Calendar props
 * @returns Calendar element
 */
export function StudyCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  onEventResize,
}: StudyCalendarProps): React.ReactElement {
  const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  /**
   * Handle event drop
   */
  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
      // Don't allow moving exams
      if (event.isExam) return;
      onEventDrop({
        event,
        start: start instanceof Date ? start : new Date(start),
        end: end instanceof Date ? end : new Date(end),
      });
    },
    [onEventDrop]
  );

  /**
   * Handle event resize
   */
  const handleEventResize = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: string | Date; end: string | Date }) => {
      // Don't allow resizing exams
      if (event.isExam) return;
      onEventResize({
        event,
        start: start instanceof Date ? start : new Date(start),
        end: end instanceof Date ? end : new Date(end),
      });
    },
    [onEventResize]
  );

  /**
   * Handle slot selection
   */
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      onSelectSlot({ start: slotInfo.start, end: slotInfo.end });
    },
    [onSelectSlot]
  );

  /**
   * Custom components
   */
  const components = useMemo(
    () => ({
      event: ({ event }: { event: CalendarEvent }) => (
        <div className={styles.eventContent}>
          {event.isExam && <span className={styles.examBadge}>EXAM</span>}
          <span className={styles.eventTitle}>{event.title}</span>
        </div>
      ),
    }),
    []
  );

  // Default date to February 2026 for better exam visibility
  const defaultDate = useMemo(() => new Date(2026, 1, 1), []);

  return (
    <div className={styles.calendarWrapper}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)', minHeight: 600 }}
        view={currentView}
        onView={(view: View) => setCurrentView(view)}
        date={currentDate}
        onNavigate={(date: Date) => setCurrentDate(date)}
        defaultDate={defaultDate}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        selectable
        resizable
        onSelectEvent={onSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        components={components}
        step={30}
        timeslots={2}
        min={new Date(0, 0, 0, 6, 0, 0)}
        max={new Date(0, 0, 0, 23, 0, 0)}
        draggableAccessor={(event: CalendarEvent) => !event.isExam}
        resizableAccessor={(event: CalendarEvent) => !event.isExam}
      />
    </div>
  );
}

export default StudyCalendar;

import { useState } from "react";
import { Button, Modal } from "../components";
import { StudyCalendar, SessionForm } from "../components";
import { useSessions } from "../hooks";
import type { CreateSessionData } from "../hooks/useSessions";
import type { CalendarEvent } from "../types";
import styles from "./CalendarPage.module.css";

function CalendarPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const { addSession, moveSession, calendarEvents } = useSessions();

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsFormOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    // For now, just log event details - could open edit modal in future
    console.log('Selected event:', event.title, event.start, event.end);
    void event; // Mark as intentionally unused for now
  };

  const handleAddSession = (data: CreateSessionData) => {
    addSession(data);
    setIsFormOpen(false);
    setSelectedSlot(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSlot(null);
  };

  const handleEventDrop = (args: { event: CalendarEvent; start: Date; end: Date }) => {
    moveSession(args.event.id, args.start, args.end);
  };

  const handleEventResize = (args: { event: CalendarEvent; start: Date; end: Date }) => {
    moveSession(args.event.id, args.start, args.end);
  };

  return (
    <div className={styles.calendarPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Study Calendar</h1>
        <Button onClick={() => setIsFormOpen(true)}>Add Session</Button>
      </header>

      <div className={styles.calendarContainer}>
        <StudyCalendar
          events={calendarEvents}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
        />
      </div>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title="Add Study Session">
        <SessionForm
          onSubmit={handleAddSession}
          onCancel={handleCloseForm}
          initialStart={selectedSlot?.start}
          initialEnd={selectedSlot?.end}
        />
      </Modal>
    </div>
  );
}

export default CalendarPage;
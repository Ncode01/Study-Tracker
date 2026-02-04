import { useState } from "react";
import { StudyCalendar, SessionForm } from "../components";
import { useSessions } from "../hooks";
import type { CreateSessionData } from "../hooks/useSessions";
import type { CalendarEvent } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

function CalendarPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const { addSession, moveSession, calendarEvents } = useSessions();

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsFormOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('Selected event:', event.title, event.start, event.end);
    void event;
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
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Study Calendar
          </h1>
          <p className="text-muted-foreground">Manage your study sessions</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add Session
        </button>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl p-4 shadow-sm overflow-hidden">
        <StudyCalendar
          events={calendarEvents}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
        />
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseForm}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Plan Study Session</h2>
                <button onClick={handleCloseForm}><Plus className="rotate-45" /></button>
              </div>
              <SessionForm
                onSubmit={handleAddSession}
                onCancel={handleCloseForm}
                initialStart={selectedSlot?.start}
                initialEnd={selectedSlot?.end}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CalendarPage;
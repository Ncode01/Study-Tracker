import React, { useState } from 'react';
import type { Task, Subject, RecurrenceType, Priority } from '../../types';
import { SUBJECTS } from '../../types';
import { validateTask, formatDateForInput } from '../../utils';


export interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: {
    title: string;
    subject: Subject;
    dueDate: string;
    recurrence: RecurrenceType;
    priority: Priority;
  }) => void;
  onCancel: () => void;
}

export function TaskForm({
  task,
  onSubmit,
  onCancel,
}: TaskFormProps): React.ReactElement {
  const [title, setTitle] = useState(task?.title || '');
  const [subject, setSubject] = useState<Subject>(task?.subject || 'Mathematics');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? formatDateForInput(task.dueDate) : formatDateForInput(new Date())
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task?.recurrence || 'none');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTask({
      title,
      subject,
      dueDate,
      recurrence,
      priority,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      title: title.trim(),
      subject,
      dueDate: new Date(dueDate).toISOString(),
      recurrence,
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Task Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="What do you need to study?"
          autoFocus
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value as Subject)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurrence</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="none">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-lg shadow-primary/20"
        >
          {task ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;

/**
 * @fileoverview Task form component for add/edit.
 */

import React, { useState } from 'react';
import type { Task, Subject, RecurrenceType, Priority } from '../../types';
import { SUBJECTS } from '../../types';
import { Button, Input, Select } from '../common';
import { validateTask, formatDateForInput } from '../../utils';
import styles from './TaskForm.module.css';

/**
 * Task form props
 */
export interface TaskFormProps {
  /** Task to edit (null for new) */
  task?: Task | null;
  /** Submit handler */
  onSubmit: (data: {
    title: string;
    subject: Subject;
    dueDate: string;
    recurrence: RecurrenceType;
    priority: Priority;
  }) => void;
  /** Cancel handler */
  onCancel: () => void;
}

/**
 * Task form component
 * @param props - Form props
 * @returns Form element
 */
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

  /**
   * Handle form submission
   */
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

  const subjectOptions = SUBJECTS.map((s) => ({ value: s, label: s }));
  const recurrenceOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ];
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title..."
        error={errors.title}
        fullWidth
        autoFocus
      />

      <Select
        label="Subject"
        options={subjectOptions}
        value={subject}
        onChange={(val) => setSubject(val as Subject)}
        error={errors.subject}
        fullWidth
      />

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        error={errors.dueDate}
        fullWidth
      />

      <div className={styles.row}>
        <Select
          label="Repeat"
          options={recurrenceOptions}
          value={recurrence}
          onChange={(val) => setRecurrence(val as RecurrenceType)}
          fullWidth
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={(val) => setPriority(val as Priority)}
          fullWidth
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;

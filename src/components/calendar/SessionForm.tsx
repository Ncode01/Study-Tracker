/**
 * @fileoverview Session form component for calendar events.
 */

import React, { useState } from 'react';
import type { StudySession, Subject } from '../../types';
import { SUBJECTS } from '../../types';
import { Button, Input, Select } from '../common';
import { validateSession, formatDateTimeForInput } from '../../utils';
import styles from './SessionForm.module.css';

/**
 * Session form props
 */
export interface SessionFormProps {
  /** Session to edit (null for new) */
  session?: StudySession | null;
  /** Initial start time */
  initialStart?: Date;
  /** Initial end time */
  initialEnd?: Date;
  /** Submit handler */
  onSubmit: (data: {
    title: string;
    subject: Subject;
    start: string;
    end: string;
    notes?: string;
  }) => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Delete handler */
  onDelete?: () => void;
}

/**
 * Session form component
 * @param props - Form props
 * @returns Form element
 */
export function SessionForm({
  session,
  initialStart,
  initialEnd,
  onSubmit,
  onCancel,
  onDelete,
}: SessionFormProps): React.ReactElement {
  const getDefaultStart = () => {
    if (session) return formatDateTimeForInput(session.start);
    if (initialStart) return formatDateTimeForInput(initialStart);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return formatDateTimeForInput(now);
  };

  const getDefaultEnd = () => {
    if (session) return formatDateTimeForInput(session.end);
    if (initialEnd) return formatDateTimeForInput(initialEnd);
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return formatDateTimeForInput(now);
  };

  const [title, setTitle] = useState(session?.title || '');
  const [subject, setSubject] = useState<Subject>(session?.subject || 'Mathematics');
  const [start, setStart] = useState(getDefaultStart());
  const [end, setEnd] = useState(getDefaultEnd());
  const [notes, setNotes] = useState(session?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSession({
      title,
      subject,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      title: title.trim(),
      subject,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      notes: notes.trim() || undefined,
    });
  };

  const subjectOptions = SUBJECTS.map((s) => ({ value: s, label: s }));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Session Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Math Practice - Algebra"
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

      <div className={styles.row}>
        <Input
          label="Start Time"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          error={errors.start}
          fullWidth
        />

        <Input
          label="End Time"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          error={errors.end}
          fullWidth
        />
      </div>

      <div className={styles.notesWrapper}>
        <label className={styles.label}>Notes (optional)</label>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for this study session..."
          rows={3}
        />
      </div>

      <div className={styles.actions}>
        {onDelete && session && (
          <Button type="button" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
        <div className={styles.rightActions}>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {session ? 'Update Session' : 'Add Session'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default SessionForm;

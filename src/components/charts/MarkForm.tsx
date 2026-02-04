/**
 * @fileoverview Mark form component.
 */

import React, { useState } from 'react';
import type { Mark, Subject } from '../../types';
import { SUBJECTS } from '../../types';
import { Button, Input, Select } from '../common';
import { validateMark, formatDateForInput } from '../../utils';
import styles from './MarkForm.module.css';

/**
 * Mark form props
 */
export interface MarkFormProps {
  /** Mark to edit (null for new) */
  mark?: Mark | null;
  /** Submit handler */
  onSubmit: (data: {
    subject: Subject;
    score: number;
    maxScore: number;
    date: string;
    testName?: string;
  }) => void;
  /** Cancel handler */
  onCancel: () => void;
}

/**
 * Mark form component
 * @param props - Form props
 * @returns Form element
 */
export function MarkForm({
  mark,
  onSubmit,
  onCancel,
}: MarkFormProps): React.ReactElement {
  const [subject, setSubject] = useState<Subject>(mark?.subject || 'Mathematics');
  const [score, setScore] = useState(mark?.score?.toString() || '');
  const [maxScore, setMaxScore] = useState(mark?.maxScore?.toString() || '100');
  const [date, setDate] = useState(
    mark?.date ? formatDateForInput(mark.date) : formatDateForInput(new Date())
  );
  const [testName, setTestName] = useState(mark?.testName || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scoreNum = parseFloat(score);
    const maxScoreNum = parseFloat(maxScore);

    const validation = validateMark({
      subject,
      score: scoreNum,
      maxScore: maxScoreNum,
      date,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onSubmit({
      subject,
      score: scoreNum,
      maxScore: maxScoreNum,
      date: new Date(date).toISOString(),
      testName: testName.trim() || undefined,
    });
  };

  const subjectOptions = SUBJECTS.map((s) => ({ value: s, label: s }));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Select
        label="Subject"
        options={subjectOptions}
        value={subject}
        onChange={(val) => setSubject(val as Subject)}
        error={errors.subject}
        fullWidth
      />

      <Input
        label="Test/Practice Name (optional)"
        value={testName}
        onChange={(e) => setTestName(e.target.value)}
        placeholder="e.g., Chapter 5 Quiz"
        fullWidth
      />

      <div className={styles.row}>
        <Input
          label="Score"
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="85"
          min="0"
          error={errors.score}
          fullWidth
        />

        <Input
          label="Out of"
          type="number"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          placeholder="100"
          min="1"
          error={errors.maxScore}
          fullWidth
        />
      </div>

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        fullWidth
      />

      <div className={styles.preview}>
        {score && maxScore && (
          <div className={styles.scorePreview}>
            <span className={styles.percentage}>
              {Math.round((parseFloat(score) / parseFloat(maxScore)) * 100)}%
            </span>
            <span className={styles.scoreText}>
              {score} / {maxScore}
            </span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mark ? 'Update Score' : 'Log Score'}
        </Button>
      </div>
    </form>
  );
}

export default MarkForm;

/**
 * @fileoverview Subject badge component.
 */

import React from 'react';
import type { Subject } from '../../types';
import { SUBJECT_COLORS } from '../../types';
import styles from './SubjectBadge.module.css';

/**
 * Subject badge props
 */
export interface SubjectBadgeProps {
  /** Subject name */
  subject: Subject;
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Show only dot */
  dotOnly?: boolean;
}

/**
 * Subject badge component
 * @param props - Badge props
 * @returns Badge element
 */
export function SubjectBadge({
  subject,
  size = 'md',
  dotOnly = false,
}: SubjectBadgeProps): React.ReactElement {
  const color = SUBJECT_COLORS[subject];

  if (dotOnly) {
    return (
      <span
        className={`${styles.dot} ${styles[size]}`}
        style={{ backgroundColor: color }}
        title={subject}
        aria-label={subject}
      />
    );
  }

  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      <span className={styles.dot} style={{ backgroundColor: color }} />
      {subject}
    </span>
  );
}

export default SubjectBadge;

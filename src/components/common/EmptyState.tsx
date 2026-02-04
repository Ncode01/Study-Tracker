/**
 * @fileoverview Empty state component.
 */

import React from 'react';
import styles from './EmptyState.module.css';

/**
 * Empty state props
 */
export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Action button */
  action?: React.ReactNode;
}

/**
 * Empty state placeholder component
 * @param props - Empty state props
 * @returns Empty state element
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className={styles.container}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default EmptyState;

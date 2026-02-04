/**
 * @fileoverview Card component.
 */

import React from 'react';
import styles from './Card.module.css';

/**
 * Card component props
 */
export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Additional class name */
  className?: string;
  /** Card padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover effect */
  hoverable?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Card container component
 * @param props - Card props
 * @returns Card element
 */
export function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
}: CardProps): React.ReactElement {
  const cardClasses = [
    styles.card,
    styles[`padding-${padding}`],
    hoverable ? styles.hoverable : '',
    onClick ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default Card;

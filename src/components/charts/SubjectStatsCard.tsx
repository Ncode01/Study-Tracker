/**
 * @fileoverview Subject stats card component.
 */

import React from 'react';
import type { SubjectStats } from '../../types';
import { SUBJECT_COLORS } from '../../types';
import { Card, SubjectBadge } from '../common';
import styles from './SubjectStatsCard.module.css';

/**
 * Subject stats card props
 */
export interface SubjectStatsCardProps {
  /** Subject statistics */
  stats: SubjectStats;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Trend icon component
 */
function TrendIcon({ trend }: { trend: SubjectStats['trend'] }): React.ReactElement {
  if (trend === 'improving') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.trendUp}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }
  if (trend === 'declining') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.trendDown}>
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.trendStable}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Subject stats card component
 * @param props - Card props
 * @returns Card element
 */
export function SubjectStatsCard({
  stats,
  onClick,
}: SubjectStatsCardProps): React.ReactElement {
  const color = SUBJECT_COLORS[stats.subject];
  const isWeak = stats.totalTests > 0 && stats.averageScore < 60;

  return (
    <Card
      className={`${styles.card} ${isWeak ? styles.weak : ''}`}
      hoverable
      onClick={onClick}
      padding="md"
    >
      <div className={styles.header}>
        <SubjectBadge subject={stats.subject} size="sm" />
        <TrendIcon trend={stats.trend} />
      </div>

      <div className={styles.score}>
        <span
          className={styles.percentage}
          style={{ color: stats.totalTests > 0 ? color : 'var(--color-gray-400)' }}
        >
          {stats.totalTests > 0 ? `${stats.averageScore}%` : '-'}
        </span>
        {isWeak && <span className={styles.weakBadge}>Needs Focus</span>}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.totalTests}</span>
          <span className={styles.statLabel}>Tests</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {stats.totalStudyHours > 0 ? `${Math.round(stats.totalStudyHours)}h` : '-'}
          </span>
          <span className={styles.statLabel}>Study Time</span>
        </div>
        {stats.latestScore !== undefined && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.latestScore}%</span>
            <span className={styles.statLabel}>Latest</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default SubjectStatsCard;

/**
 * @fileoverview Progress chart component.
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Subject } from '../../types';
import { SUBJECTS, SUBJECT_COLORS } from '../../types';
import styles from './ProgressChart.module.css';

/**
 * Chart data point
 */
export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

/**
 * Progress chart props
 */
export interface ProgressChartProps {
  /** Chart data */
  data: ChartDataPoint[];
  /** Subjects to show */
  subjects?: Subject[];
  /** Chart title */
  title?: string;
}

/**
 * Progress chart component
 * @param props - Chart props
 * @returns Chart element
 */
export function ProgressChart({
  data,
  subjects = SUBJECTS,
  title = 'Progress Over Time',
}: ProgressChartProps): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No data available yet. Start logging scores to see your progress!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
              tickLine={{ stroke: 'var(--color-gray-300)' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
              tickLine={{ stroke: 'var(--color-gray-300)' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
              }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend />
            {subjects.map((subject) => (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
                stroke={SUBJECT_COLORS[subject]}
                strokeWidth={2}
                dot={{ fill: SUBJECT_COLORS[subject], r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProgressChart;

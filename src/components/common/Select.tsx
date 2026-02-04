/**
 * @fileoverview Select component.
 */

import React from 'react';
import styles from './Select.module.css';

/**
 * Select option
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Select component props
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /** Select label */
  label?: string;
  /** Select options */
  options: SelectOption[];
  /** Error message */
  error?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Reusable select component
 * @param props - Select props
 * @returns Select element
 */
export function Select({
  label,
  options,
  error,
  fullWidth = false,
  className = '',
  id,
  onChange,
  placeholder,
  value,
  ...props
}: SelectProps): React.ReactElement {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          id={selectId}
          className={`${styles.select} ${error ? styles.error : ''} ${className}`}
          value={value}
          onChange={handleChange}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {error && (
        <span className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Select;

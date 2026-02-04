/**
 * @fileoverview Main layout wrapper component.
 */

import React from 'react';
import { Header } from './Header';
import type { ViewName } from '../../types';
import styles from './Layout.module.css';

/**
 * Layout component props
 */
export interface LayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Current active view */
  currentView: ViewName;
  /** Navigation handler */
  onNavigate: (view: ViewName) => void;
}

/**
 * Main layout wrapper
 * @param props - Layout props
 * @returns Layout element
 */
export function Layout({ children, currentView, onNavigate }: LayoutProps): React.ReactElement {
  return (
    <div className={styles.layout}>
      <Header currentView={currentView} onViewChange={onNavigate} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

export default Layout;

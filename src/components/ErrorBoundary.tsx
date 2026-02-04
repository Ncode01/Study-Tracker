/**
 * @fileoverview Global Error Boundary component for catching and displaying React errors.
 * @module components/ErrorBoundary
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI to show on error */
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred, if any */
  error: Error | null;
  /** Additional error info from React */
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child
 * component tree, logs the errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method called when an error is thrown.
   * Updates state to trigger fallback UI.
   *
   * @param error - The error that was thrown
   * @returns Updated state object
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error is caught.
   * Used for logging error details.
   *
   * @param error - The error that was thrown
   * @param errorInfo - Additional React error information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log error to console (could be sent to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * Handles retry button click to reset error state.
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Handles reload button click to refresh the page.
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Return custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>
              The application encountered an unexpected error. Don't worry, your data
              is safely stored in your browser.
            </p>

            {error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details</summary>
                <pre style={styles.errorText}>
                  {error.toString()}
                  {errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:'}
                      {errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div style={styles.buttons}>
              <button
                onClick={this.handleRetry}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Inline styles for the error boundary fallback UI.
 * Using inline styles to ensure they work even if CSS fails to load.
 */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  content: {
    maxWidth: '500px',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: '0 0 12px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  details: {
    textAlign: 'left',
    marginBottom: '24px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #e0e0e0',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 500,
    color: '#333',
    padding: '4px 0',
  },
  errorText: {
    fontSize: '12px',
    color: '#e53935',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginTop: '12px',
    maxHeight: '200px',
    overflow: 'auto',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s',
  },
  primaryButton: {
    backgroundColor: '#4285f4',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
};

export default ErrorBoundary;

/**
 * ErrorBoundary Component with Sentry Integration
 * Author: Giuseppe Bosi
 * 
 * Catches React component errors and reports them to Sentry
 */

import React from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}>
          <h1>Something went wrong</h1>
          <p>An error occurred while rendering the application.</p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            The error has been reported to our team.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: ({ error, resetError }) => (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1>Something went wrong</h1>
      <p>An error occurred while rendering the application.</p>
      <button
        onClick={resetError}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Try Again
      </button>
    </div>
  ),
});

/**
 * Plaid-Bank-Transfer - Frontend Entry Point
 * Author: Giuseppe Bosi
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

// Initialize Sentry
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV || 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions for replay
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
});

// Get root element and render App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

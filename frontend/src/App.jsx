/**
 * Plaid-Bank-Transfer - Main Application Component
 * Author: Giuseppe Bosi
 * 
 * This component manages:
 * - Plaid Link initialization and authentication
 * - Transaction data fetching
 * - Application state management
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as Sentry from '@sentry/react';
import TransactionsTable from './TransactionsTable';
import './App.css';

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001';

// Load Plaid Link script dynamically
// Plaid Link is loaded from CDN and provides the UI for bank authentication
const loadPlaidScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.Plaid) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Plaid Link script'));
    document.body.appendChild(script);
  });
};

function App() {
  // Application state
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [linkHandler, setLinkHandler] = useState(null);

  /**
   * Initialize Plaid Link
   * Creates a link token from backend and initializes Plaid Link
   */
  const initializePlaidLink = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load Plaid Link script if not already loaded
      await loadPlaidScript();

      // Request link token from backend
      const response = await axios.post(`${API_BASE_URL}/api/create_link_token`);
      const token = response.data.link_token;

      setLinkToken(token);

      // Initialize Plaid Link with the token
      // Plaid.create() returns a handler that can be used to open Link
      const handler = window.Plaid.create({
        token: token,
        onSuccess: (publicToken, metadata) => {
          // Called when user successfully connects a bank account
          console.log('Plaid Link success:', metadata);
          handleSetAccessToken(publicToken);
        },
        onExit: (err, metadata) => {
          // Called when user exits Plaid Link
          if (err) {
            console.error('Plaid Link error:', err);
            Sentry.captureException(err, {
              tags: { component: 'App', function: 'PlaidLink-onExit' },
              extra: { metadata },
            });
            setError(err.error_message || 'Failed to connect bank account');
          }
          setIsLoading(false);
        },
        onEvent: (eventName, metadata) => {
          // Optional: Handle Link events for analytics
          console.log('Plaid Link event:', eventName, metadata);
        },
      });

      setLinkHandler(handler);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Plaid Link:', err);
      Sentry.captureException(err, {
        tags: { component: 'App', function: 'initializePlaidLink' },
        extra: { apiUrl: API_BASE_URL },
      });
      setError(err.response?.data?.error?.error_message || 'Failed to initialize Plaid Link');
      setIsLoading(false);
    }
  }, []);

  /**
   * Exchange public token for access token
   * Called after successful Plaid Link authentication
   */
  const handleSetAccessToken = async (publicToken) => {
    try {
      setIsLoading(true);
      setError(null);

      // Exchange public token for access token via backend
      await axios.post(`${API_BASE_URL}/api/set_access_token`, {
        public_token: publicToken,
      });

      setIsConnected(true);
      setIsLoading(false);

      // Automatically fetch transactions after connection
      fetchTransactions();
    } catch (err) {
      console.error('Error setting access token:', err);
      Sentry.captureException(err, {
        tags: { component: 'App', function: 'handleSetAccessToken' },
        extra: { apiUrl: API_BASE_URL },
      });
      setError(err.response?.data?.error?.error_message || 'Failed to connect bank account');
      setIsLoading(false);
    }
  };

  /**
   * Fetch transactions from last 7 days
   * Calls backend API to retrieve all transactions with all available fields
   */
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request transactions from backend
      const response = await axios.get(`${API_BASE_URL}/api/transactions_last_7_days`);
      
      // Backend returns transactions array with all fields
      setTransactions(response.data.transactions || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      Sentry.captureException(err, {
        tags: { component: 'App', function: 'fetchTransactions' },
        extra: { apiUrl: API_BASE_URL },
      });
      setError(err.response?.data?.error?.error_message || 'Failed to fetch transactions');
      setIsLoading(false);
    }
  };

  /**
   * Open Plaid Link
   * Opens the Plaid Link UI for bank authentication
   */
  const openPlaidLink = () => {
    if (linkHandler) {
      linkHandler.open();
      setIsLoading(true);
    } else {
      setError('Plaid Link not initialized. Please refresh the page.');
    }
  };

  /**
   * Check connection status on component mount
   */
  useEffect(() => {
    // Check if already connected by calling info endpoint
    axios.get(`${API_BASE_URL}/api/info`)
      .then(response => {
        if (response.data.access_token) {
          setIsConnected(true);
          fetchTransactions();
        } else {
          // Not connected, initialize Plaid Link
          initializePlaidLink();
        }
      })
      .catch(err => {
        console.error('Error checking connection status:', err);
        Sentry.captureException(err, {
          tags: { component: 'App', function: 'useEffect-connectionCheck' },
          extra: { apiUrl: API_BASE_URL },
        });
        // Initialize Plaid Link anyway
        initializePlaidLink();
      });
  }, [initializePlaidLink]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Plaid-Bank-Transfer</h1>
        <p className="subtitle">Bank Transaction Monitor - Last 7 Days</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!isConnected && !isLoading && (
          <div className="connection-section">
            <h2>Connect Your Bank Account</h2>
            <p>Click the button below to securely connect your bank account using Plaid.</p>
            <button 
              onClick={openPlaidLink} 
              className="connect-button"
              disabled={!linkHandler}
            >
              Connect Bank Account
            </button>
            {!linkHandler && (
              <p className="loading-text">Initializing Plaid Link...</p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {isConnected && (
          <div className="transactions-section">
            <div className="section-header">
              <h2>Transactions - Last 7 Days</h2>
              <button 
                onClick={fetchTransactions} 
                className="refresh-button"
                disabled={isLoading}
              >
                Refresh
              </button>
            </div>

            {transactions.length === 0 && !isLoading && (
              <p className="no-transactions">No transactions found in the last 7 days.</p>
            )}

            {transactions.length > 0 && (
              <TransactionsTable transactions={transactions} />
            )}
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Author: Giuseppe Bosi</p>
        <p>Powered by Plaid API</p>
      </footer>
    </div>
  );
}

export default App;

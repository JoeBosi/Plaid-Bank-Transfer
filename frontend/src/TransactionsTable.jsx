/**
 * TransactionsTable Component
 * Author: Giuseppe Bosi
 * 
 * Displays all bank transactions with all available fields from Plaid API
 * Shows transactions from last 7 days in a comprehensive table format
 */

import React, { useState } from 'react';
import './TransactionsTable.css';

/**
 * Format date string to readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format datetime string to readable format
 * @param {string} datetimeString - ISO datetime string
 * @returns {string} Formatted datetime string
 */
const formatDateTime = (datetimeString) => {
  if (!datetimeString) return 'N/A';
  const date = new Date(datetimeString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format amount with currency
 * @param {number} amount - Transaction amount
 * @param {string} currencyCode - Currency code (e.g., "USD")
 * @returns {string} Formatted amount string
 */
const formatAmount = (amount, currencyCode = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  const formatted = Math.abs(amount).toFixed(2);
  const sign = amount < 0 ? '-' : '+';
  return `${sign}${currencyCode} ${formatted}`;
};

/**
 * Format array or object to readable string
 * @param {any} value - Value to format
 * @returns {string} Formatted string
 */
const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'N/A';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

/**
 * Get transaction status badge class
 * @param {boolean} pending - Whether transaction is pending
 * @returns {string} CSS class name
 */
const getStatusClass = (pending) => {
  return pending ? 'status-pending' : 'status-posted';
};

function TransactionsTable({ transactions }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  /**
   * Toggle row expansion to show/hide additional fields
   * @param {string} transactionId - Transaction ID
   */
  const toggleRow = (transactionId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  // Get all unique field keys from all transactions
  // This ensures we display all available fields
  const allFields = new Set();
  transactions.forEach(transaction => {
    Object.keys(transaction).forEach(key => {
      allFields.add(key);
    });
  });

  // Define primary fields to show in main table
  const primaryFields = [
    'date',
    'name',
    'merchant_name',
    'amount',
    'iso_currency_code',
    'pending',
    'category',
    'payment_channel',
  ];

  // Get additional fields (not in primary list)
  const additionalFields = Array.from(allFields).filter(
    field => !primaryFields.includes(field)
  );

  return (
    <div className="transactions-table-container">
      <div className="table-info">
        <p>Total transactions: <strong>{transactions.length}</strong></p>
        <p>Click on a row to view all available fields</p>
      </div>

      <div className="table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Category</th>
              <th>Payment Channel</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const isExpanded = expandedRows.has(transaction.transaction_id);
              
              return (
                <React.Fragment key={transaction.transaction_id}>
                  <tr 
                    className={`transaction-row ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleRow(transaction.transaction_id)}
                  >
                    <td>{formatDate(transaction.date)}</td>
                    <td className="name-cell">{transaction.name || 'N/A'}</td>
                    <td>{transaction.merchant_name || 'N/A'}</td>
                    <td className={`amount-cell ${transaction.amount < 0 ? 'negative' : 'positive'}`}>
                      {formatAmount(transaction.amount, transaction.iso_currency_code)}
                    </td>
                    <td>{transaction.iso_currency_code || transaction.unofficial_currency_code || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(transaction.pending)}`}>
                        {transaction.pending ? 'Pending' : 'Posted'}
                      </span>
                    </td>
                    <td>{formatValue(transaction.category)}</td>
                    <td>{transaction.payment_channel || 'N/A'}</td>
                    <td>
                      <button className="toggle-button">
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="details-row">
                      <td colSpan="9">
                        <div className="transaction-details">
                          <h4>All Transaction Fields</h4>
                          <div className="fields-grid">
                            {/* Primary fields (already shown in table) */}
                            <div className="field-group">
                              <h5>Primary Information</h5>
                              {primaryFields.map(field => (
                                <div key={field} className="field-item">
                                  <strong>{field}:</strong>
                                  <span>{formatValue(transaction[field])}</span>
                                </div>
                              ))}
                            </div>

                            {/* Additional fields */}
                            {additionalFields.length > 0 && (
                              <div className="field-group">
                                <h5>Additional Fields</h5>
                                {additionalFields.map(field => (
                                  <div key={field} className="field-item">
                                    <strong>{field}:</strong>
                                    <span className="field-value">
                                      {field === 'authorized_date' || field === 'date' ? 
                                        formatDate(transaction[field]) :
                                        field === 'authorized_datetime' || field === 'datetime' ?
                                        formatDateTime(transaction[field]) :
                                        formatValue(transaction[field])
                                      }
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Location information */}
                            {transaction.location && (
                              <div className="field-group">
                                <h5>Location Information</h5>
                                {Object.entries(transaction.location).map(([key, value]) => (
                                  <div key={key} className="field-item">
                                    <strong>location.{key}:</strong>
                                    <span>{formatValue(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Personal finance category */}
                            {transaction.personal_finance_category && (
                              <div className="field-group">
                                <h5>Personal Finance Category</h5>
                                {Object.entries(transaction.personal_finance_category).map(([key, value]) => (
                                  <div key={key} className="field-item">
                                    <strong>personal_finance_category.{key}:</strong>
                                    <span>{formatValue(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <p className="no-transactions-message">No transactions to display.</p>
      )}
    </div>
  );
}

export default TransactionsTable;

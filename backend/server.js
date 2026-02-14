'use strict';

/**
 * Plaid-Bank-Transfer - Backend Server
 * Author: Giuseppe Bosi
 * 
 * Express server with Plaid API integration for bank transaction monitoring
 */

// Load environment variables from .env file
require('dotenv').config();

// ============================================
// SENTRY INITIALIZATION (must be before other imports)
// Only init when SENTRY_DSN is set; otherwise Handlers are undefined
// ============================================
const Sentry = require('@sentry/node');
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENABLED = Boolean(SENTRY_DSN && SENTRY_DSN.trim());

if (SENTRY_ENABLED) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.PLAID_ENV || 'sandbox',
    tracesSampleRate: 1.0,
    integrations: [Sentry.httpIntegration()],
  });
}

// ============================================
// EXTERNAL LIBRARIES
// Installation: npm install express plaid dotenv cors moment @sentry/node
// ============================================
const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments, Products } = require('plaid');
const cors = require('cors');
const moment = require('moment');

// Configuration from environment variables
const APP_PORT = process.env.APP_PORT || 4001;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// Validate required environment variables
if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('ERROR: PLAID_CLIENT_ID and PLAID_SECRET must be set in .env file');
  process.exit(1);
}

// Initialize Plaid client
// PlaidEnvironments provides base URLs for different environments (sandbox, development, production)
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14', // API version
    },
  },
});

const client = new PlaidApi(configuration);

// Initialize Express application
const app = express();

// Sentry middleware only when DSN is set (Handlers undefined otherwise)
if (SENTRY_ENABLED) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Middleware configuration
// bodyParser middleware is included in Express 4.16+
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cors()); // Enable CORS for all routes (allows frontend to make requests)

// In-memory storage for access token
// NOTE: In production, store this in a secure database
let ACCESS_TOKEN = null;
let ITEM_ID = null;

/**
 * Utility function to pretty print JSON responses
 * Useful for debugging API responses
 */
function prettyPrintResponse(response) {
  console.log(JSON.stringify(response, null, 2));
}

/**
 * Error handling middleware
 * Catches errors from async route handlers and sends appropriate HTTP responses
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (SENTRY_ENABLED) Sentry.captureException(err);
  
  // Plaid API errors have a specific structure
  if (err.response && err.response.data) {
    const plaidError = err.response.data;
    return res.status(400).json({
      error: {
        error_code: plaidError.error_code,
        error_message: plaidError.error_message,
        display_message: plaidError.display_message,
      },
    });
  }
  
  // Generic error response
  res.status(500).json({
    error: {
      error_message: err.message || 'Internal server error',
    },
  });
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/info
 * Returns current connection status and configuration
 */
app.get('/api/info', (req, res) => {
  res.json({
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN ? '***' : null, // Don't expose full token
    environment: PLAID_ENV,
    products: [Products.Transactions],
  });
});

/**
 * POST /api/create_link_token
 * Creates a Plaid Link token for frontend initialization
 * This token is used to initialize Plaid Link in the browser
 * 
 * Documentation: https://plaid.com/docs/api/link/#linktokencreate
 */
app.post('/api/create_link_token', async (req, res, next) => {
  try {
    const configs = {
      user: {
        // Unique identifier for the current user
        // In production, use actual user ID from your authentication system
        client_user_id: 'user-' + Date.now(),
      },
      client_name: 'Plaid-Bank-Transfer',
      products: [Products.Transactions], // Only Transactions product for this app
      country_codes: ['US', 'IT'], // Supported countries (add more as needed)
      language: 'en',
    };

    // Create link token via Plaid API
    const createTokenResponse = await client.linkTokenCreate(configs);
    
    // Log response for debugging (optional)
    prettyPrintResponse(createTokenResponse.data);
    
    // Return link token to frontend
    res.json(createTokenResponse.data);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

/**
 * POST /api/set_access_token
 * Exchanges Plaid public token for access token
 * 
 * Flow:
 * 1. User completes Plaid Link flow in frontend
 * 2. Plaid Link returns a public_token
 * 3. Frontend sends public_token to this endpoint
 * 4. Backend exchanges public_token for access_token
 * 5. Access token is stored and used for subsequent API calls
 * 
 * Documentation: https://plaid.com/docs/api/items/#itempublic_tokenexchange
 */
app.post('/api/set_access_token', async (req, res, next) => {
  try {
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({
        error: {
          error_message: 'public_token is required',
        },
      });
    }

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: public_token,
    });

    // Store access token and item ID
    ACCESS_TOKEN = exchangeResponse.data.access_token;
    ITEM_ID = exchangeResponse.data.item_id;

    // Log response for debugging
    prettyPrintResponse(exchangeResponse.data);

    // Return success response
    res.json({
      access_token: '***', // Don't expose full token
      item_id: ITEM_ID,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions_last_7_days
 * Retrieves all transactions from the last 7 days with all available fields
 * 
 * Uses Plaid transactionsSync API which provides incremental updates
 * For initial sync, cursor is empty to get all historical transactions
 * 
 * Documentation: https://plaid.com/docs/api/transactions/#transactionssync
 */
app.get('/api/transactions_last_7_days', async (req, res, next) => {
  try {
    // Check if access token is available
    if (!ACCESS_TOKEN) {
      return res.status(400).json({
        error: {
          error_message: 'No access token. Please connect a bank account first.',
        },
      });
    }

    // Calculate date range: last 7 days
    const endDate = moment().format('YYYY-MM-DD'); // Today
    const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD'); // 7 days ago

    console.log(`Fetching transactions from ${startDate} to ${endDate}`);

    // Use transactionsSync for incremental updates
    // Start with empty cursor to get all transactions
    let cursor = null;
    let allTransactions = [];
    let hasMore = true;

    // Iterate through all pages of transactions
    while (hasMore) {
      const request = {
        access_token: ACCESS_TOKEN,
        cursor: cursor,
      };

      const response = await client.transactionsSync(request);
      const data = response.data;

      // Update cursor for next iteration
      cursor = data.next_cursor;

      // If cursor is empty, wait a bit and continue (transactions may still be processing)
      if (cursor === '') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      // Add transactions from this page
      // transactionsSync returns added, modified, and removed transactions
      // For this use case, we only need added transactions
      allTransactions = allTransactions.concat(data.added);

      // Check if there are more pages
      hasMore = data.has_more;

      // Log progress (optional)
      console.log(`Fetched ${data.added.length} transactions. Has more: ${hasMore}`);
    }

    // Filter transactions by date range (last 7 days)
    // Plaid returns transactions in YYYY-MM-DD format
    const filteredTransactions = allTransactions.filter(transaction => {
      const transactionDate = moment(transaction.date);
      const start = moment(startDate);
      const end = moment(endDate);
      return transactionDate.isSameOrAfter(start) && transactionDate.isSameOrBefore(end);
    });

    // Sort by date (most recent first)
    filteredTransactions.sort((a, b) => {
      return moment(b.date).valueOf() - moment(a.date).valueOf();
    });

    console.log(`Total transactions in last 7 days: ${filteredTransactions.length}`);

    // Return all transactions with all available fields
    // Plaid transaction objects contain many fields - we return everything
    res.json({
      transactions: filteredTransactions,
      count: filteredTransactions.length,
      date_range: {
        start_date: startDate,
        end_date: endDate,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Alternative endpoint using transactionsGet (if you prefer direct date range query)
 * GET /api/transactions_get_last_7_days
 * 
 * This endpoint uses transactionsGet which allows direct date range filtering
 * May be simpler but doesn't support incremental sync
 * 
 * Documentation: https://plaid.com/docs/api/transactions/#transactionsget
 */
app.get('/api/transactions_get_last_7_days', async (req, res, next) => {
  try {
    if (!ACCESS_TOKEN) {
      return res.status(400).json({
        error: {
          error_message: 'No access token. Please connect a bank account first.',
        },
      });
    }

    // Calculate date range: last 7 days
    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');

    console.log(`Fetching transactions from ${startDate} to ${endDate}`);

    // Get all accounts first (needed for transactionsGet)
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });

    const accountIds = accountsResponse.data.accounts.map(account => account.account_id);

    // Request transactions with date range
    const request = {
      access_token: ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
      account_ids: accountIds, // Optional: filter by specific accounts
    };

    const response = await client.transactionsGet(request);
    const transactions = response.data.transactions;

    // Sort by date (most recent first)
    transactions.sort((a, b) => {
      return moment(b.date).valueOf() - moment(a.date).valueOf();
    });

    console.log(`Total transactions in last 7 days: ${transactions.length}`);

    // Return all transactions with all available fields
    res.json({
      transactions: transactions,
      count: transactions.length,
      date_range: {
        start_date: startDate,
        end_date: endDate,
      },
      total_transactions: response.data.total_transactions,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

if (SENTRY_ENABLED) app.use(Sentry.Handlers.errorHandler());

// Apply error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(APP_PORT, () => {
  console.log(`\n========================================`);
  console.log(`Plaid-Bank-Transfer - Backend Server`);
  console.log(`Author: Giuseppe Bosi`);
  console.log(`========================================`);
  console.log(`Server running on port ${APP_PORT}`);
  console.log(`Plaid Environment: ${PLAID_ENV}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /api/info`);
  console.log(`  POST /api/create_link_token`);
  console.log(`  POST /api/set_access_token`);
  console.log(`  GET  /api/transactions_last_7_days`);
  console.log(`  GET  /api/transactions_get_last_7_days`);
  console.log(`\nFrontend should connect to: http://localhost:${APP_PORT}`);
  console.log(`========================================\n`);
});

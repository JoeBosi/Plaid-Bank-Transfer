# Testing Guide

**Author:** Giuseppe Bosi

This directory contains test scripts for the Plaid-Bank-Transfer application.

## Test Structure

```
tests/
├── api/
│   └── test-endpoints.js    # API endpoint tests
├── ui/
│   └── test-ui.js           # UI tests using MCP browser
└── README.md                 # This file
```

## Prerequisites

1. **Backend server running** on `http://localhost:4001`
2. **Frontend server running** on `http://localhost:4000`
3. **MCP tools available** for executing tests

## Running Tests

### API Tests

The API test script (`tests/api/test-endpoints.js`) defines test cases for all backend endpoints:

- `GET /api/info` - Connection status endpoint
- `POST /api/create_link_token` - Link token creation
- `POST /api/set_access_token` - Access token exchange (error cases)
- `GET /api/transactions_last_7_days` - Transaction retrieval (error cases)
- `GET /api/transactions_get_last_7_days` - Alternative transaction endpoint (error cases)

**To run API tests:**

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Use MCP tools to execute the test cases defined in `test-endpoints.js`

### UI Tests

The UI test script (`tests/ui/test-ui.js`) defines test cases for frontend functionality:

- Page load and structure
- Connection section display
- Error message handling
- API endpoint accessibility
- Layout and components

**To run UI tests:**

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. Use MCP browser tools to execute the test cases defined in `test-ui.js`

## Test Execution with MCP

The test scripts define test cases but require MCP tools to execute them. Use the following MCP tools:

### For API Tests:
- HTTP request tools to make API calls
- Response validation tools

### For UI Tests:
- Browser navigation tools
- Element interaction tools
- Snapshot/verification tools

## Expected Test Results

### API Tests

All endpoints should:
- Return appropriate HTTP status codes
- Include expected response fields
- Handle error cases correctly

### UI Tests

The frontend should:
- Load correctly
- Display connection section when not connected
- Show error messages appropriately
- Have proper page structure

## Notes

- Tests are designed to run in local development environment
- Some tests require specific states (e.g., not connected to bank)
- Error cases are tested to ensure proper error handling
- Full integration tests (with actual Plaid connection) require sandbox credentials

## Troubleshooting

### Tests fail to connect
- Verify servers are running on correct ports
- Check firewall settings
- Verify CORS configuration

### UI tests fail
- Ensure frontend is fully loaded before running tests
- Check browser console for errors
- Verify all dependencies are installed

## Future Enhancements

- Automated test execution scripts
- CI/CD integration
- Performance testing
- End-to-end flow testing with Plaid sandbox

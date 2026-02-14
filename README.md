# Plaid-Bank-Transfer

**Author:** Giuseppe Bosi

A client-server application that monitors bank transfers and matches them with customer orders using Plaid API integration.

## Overview

This application allows you to:
- Connect to your bank account via Plaid
- View all bank transactions from the last 7 days
- Display all available transaction fields
- Match transactions with customer orders (future feature)

## Project Structure

```
plaid-bank-transfer/
├── backend/              # Node.js/Express backend server
│   ├── server.js         # Main server file with Plaid endpoints
│   ├── package.json      # Backend dependencies
│   └── .env.example      # Environment variables template
├── frontend/             # React frontend application
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   ├── TransactionsTable.jsx  # Transaction display component
│   │   └── index.jsx     # Entry point
│   └── package.json      # Frontend dependencies
├── SETUP_GUIDE.md        # Complete WSL setup instructions
├── ARCHITECTURE.md       # Detailed architecture documentation
├── PROJECT_STATE.md      # Current project status
└── README.md             # This file
```

## Quick Start

### Prerequisites

- WSL (Windows Subsystem for Linux)
- Node.js LTS version
- npm
- Plaid account (get API keys from [Plaid Dashboard](https://dashboard.plaid.com))

### Installation

1. **Follow the complete setup guide:**
   See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed WSL setup instructions.

2. **Quick setup:**
   ```bash
   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Plaid credentials
   npm start

   # Frontend (in another terminal)
   cd frontend
   npm install
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:4000
   - Backend API: http://localhost:4001

## Configuration

### Ports (project standard)

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Frontend | 4000 | http://localhost:4000    |
| Backend  | 4001 | http://localhost:4001    |

All docs, scripts, and env examples use these ports. Do not use 3000/8000.

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
APP_PORT=4001
SENTRY_DSN=your_sentry_dsn_here
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:4001
REACT_APP_SENTRY_DSN=your_sentry_dsn_here
REACT_APP_ENV=development
```

Get your credentials from [Plaid Dashboard](https://dashboard.plaid.com/developers/keys).

## Features

### Step 1 (Current)
- ✅ Connect to bank account via Plaid Link
- ✅ View all transactions from last 7 days
- ✅ Display all available transaction fields

### Future Steps
- Order code matching (format: `idcliente_AAAAMMGG_HHMM_SS`)
- Automatic payment verification
- Order status updates

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Complete WSL setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Architecture and technical details
- **[PROJECT_STATE.md](PROJECT_STATE.md)**: Current project status

## Technology Stack

- **Backend:** Node.js, Express, Plaid SDK, Sentry
- **Frontend:** React, Plaid Link, Sentry
- **Environment:** WSL (Windows Subsystem for Linux)
- **Error Tracking:** Sentry (backend and frontend)
- **Testing:** MCP-based API and UI tests

## Development

### Running the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

**Scripts (project root):**
- `./restart-all.sh` — stop and restart both backend and frontend
- `./stop-servers.sh` — stop backend and frontend (ports 4001, 4000)

### Testing

**API Tests:**
See [tests/README.md](tests/README.md) for detailed testing instructions. API tests are located in `tests/api/test-endpoints.js`.

**UI Tests:**
UI tests using MCP browser tools are located in `tests/ui/test-ui.js`.

**Plaid Sandbox Credentials:**
- Username: `user_good`
- Password: `pass_good`
- 2FA Code: `1234`

For transactions testing, use:
- Institution: First Platypus Bank
- Username: `user_transactions_dynamic`
- Password: any non-blank string

### Error Tracking with Sentry

The application uses Sentry for error tracking in both backend and frontend:

**Backend Configuration:**
- Add `SENTRY_DSN` to `backend/.env`
- Errors are automatically captured and reported

**Frontend Configuration:**
- Add `REACT_APP_SENTRY_DSN` to `frontend/.env`
- Error Boundary component catches React errors
- All API errors are tracked with context

See [Sentry Documentation](https://docs.sentry.io/) for setup instructions.

## License

Copyright (c) 2026 Giuseppe Bosi

## Support

For issues and questions, refer to:
- [Plaid Documentation](https://plaid.com/docs/)
- [SETUP_GUIDE.md](SETUP_GUIDE.md) for setup issues
- [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

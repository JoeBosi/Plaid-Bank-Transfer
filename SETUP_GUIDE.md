# Complete Setup Guide - WSL Environment

**Author:** Giuseppe Bosi

This guide provides step-by-step instructions to set up and run the Plaid-Bank-Transfer application in a WSL (Windows Subsystem for Linux) environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [WSL Setup and Updates](#wsl-setup-and-updates)
3. [Node.js Installation](#nodejs-installation)
4. [Plaid Account Setup](#plaid-account-setup)
5. [Project Setup](#project-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:
- Windows 10/11 with WSL installed
- Internet connection
- Administrator access (for some commands)

## WSL Setup and Updates

### 1. Verify WSL Installation

Open WSL terminal and check version:

```bash
wsl --version
```

If WSL is not installed, follow [Microsoft's WSL installation guide](https://learn.microsoft.com/en-us/windows/wsl/install).

### 2. Update Linux Packages

Update your Linux distribution packages:

```bash
sudo apt update
sudo apt upgrade -y
```

This ensures you have the latest security updates and package versions.

### 3. Install Essential Tools

Install basic development tools:

```bash
sudo apt install -y curl wget git build-essential
```

## Node.js Installation

### Option 1: Using NodeSource Repository (Recommended)

This method provides the latest LTS version of Node.js.

1. **Add NodeSource repository:**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```

2. **Install Node.js:**

```bash
sudo apt install -y nodejs
```

3. **Verify installation:**

```bash
node --version
npm --version
```

You should see output like:
```
v20.x.x
10.x.x
```

### Option 2: Using Node Version Manager (nvm) - Alternative

If you prefer nvm for managing multiple Node.js versions:

1. **Install nvm:**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

2. **Reload shell configuration:**

```bash
source ~/.bashrc
```

3. **Install Node.js LTS:**

```bash
nvm install --lts
nvm use --lts
```

4. **Verify installation:**

```bash
node --version
npm --version
```

## Plaid Account Setup

### 1. Create Plaid Account

1. Go to [Plaid Dashboard](https://dashboard.plaid.com)
2. Sign up for a free account
3. Complete the registration process

### 2. Get API Credentials

1. Navigate to [API Keys section](https://dashboard.plaid.com/developers/keys)
2. You'll see:
   - **Client ID**: Your unique client identifier
   - **Secret keys**: Different secrets for different environments
     - **Sandbox Secret**: For testing (use this for development)
     - **Development Secret**: For development environment
     - **Production Secret**: For production (requires approval)

3. **Copy your credentials:**
   - Client ID
   - Sandbox Secret (for initial development)

### 3. Configure Plaid Environment

For development, use **Sandbox** environment:
- Allows testing without real bank accounts
- Uses test credentials
- No approval required

## Project Setup

### 1. Navigate to Project Directory

```bash
cd "/mnt/c/SynologyDrive/Joe-Dev/2026.02 - Plaid - Monitor Bonifici"
```

Or if you're cloning from a repository:

```bash
git clone <repository-url>
cd plaid-bank-transfer
```

### 2. Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

This will install all required packages:
- express
- plaid
- dotenv
- cors
- moment (or date-fns)

3. **Configure environment variables:**

```bash
cp .env.example .env
```

4. **Edit `.env` file:**

```bash
nano .env
```

Or use your preferred editor. Add your Plaid credentials:

```env
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox
APP_PORT=4001
```

**Important:** Replace `your_client_id_here` and `your_sandbox_secret_here` with your actual credentials from Plaid Dashboard.

5. **Save and exit:**
   - In nano: `Ctrl+X`, then `Y`, then `Enter`

### 3. Frontend Setup

1. **Open a new terminal window/tab** (keep backend terminal open)

2. **Navigate to frontend directory:**

```bash
cd "/mnt/c/SynologyDrive/Joe-Dev/2026.02 - Plaid - Monitor Bonifici/frontend"
```

3. **Install dependencies:**

```bash
npm install
```

This will install:
- react
- react-dom
- react-scripts (or vite)
- axios (or use native fetch)

## Running the Application

### 1. Start Backend Server

In the first terminal:

```bash
cd backend
npm start
```

You should see output like:
```
Server running on port 4001
```

**Note:** The server will run in the foreground. Keep this terminal open.

### 2. Start Frontend Development Server

In the second terminal:

```bash
cd frontend
npm start
```

This will:
- Start the React development server
- Open your browser automatically to http://localhost:4000
- Enable hot-reload for development

If the browser doesn't open automatically, manually navigate to:
```
http://localhost:4000
```

### 3. Using the Application

1. **Connect Bank Account:**
   - Click "Connect Bank" or similar button
   - Plaid Link will open
   - Select a test institution (e.g., "First Platypus Bank")
   - Use test credentials:
     - Username: `user_good`
     - Password: `pass_good`
     - 2FA Code: `1234`

2. **View Transactions:**
   - After successful connection, transactions from last 7 days will load
   - All available fields will be displayed in the table

### 4. Running in Background (Optional)

If you want to run servers in background:

**Backend:**
```bash
cd backend
nohup npm start > backend.log 2>&1 &
```

**Frontend:**
```bash
cd frontend
nohup npm start > frontend.log 2>&1 &
```

To stop background processes:
```bash
# Find process IDs
ps aux | grep node

# Kill processes
kill <PID>
```

## Troubleshooting

### Node.js Not Found

**Error:** `command not found: node` or `command not found: npm`

**Solution:**
1. Verify Node.js installation: `node --version`
2. If not installed, follow [Node.js Installation](#nodejs-installation) section
3. Restart terminal after installation
4. Check PATH: `echo $PATH`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4001` or `:4000`

**Solution:**
1. Find process using the port:
```bash
sudo lsof -i :4001
# or
sudo netstat -tulpn | grep :4001
```

2. Kill the process:
```bash
kill <PID>
```

3. Or change port in `.env` (backend) or `package.json` (frontend)

### Plaid API Errors

**Error:** `INVALID_CLIENT_ID` or `INVALID_SECRET`

**Solution:**
1. Verify credentials in `.env` file
2. Ensure no extra spaces or quotes
3. Use Sandbox secret for Sandbox environment
4. Check [Plaid Dashboard](https://dashboard.plaid.com/developers/keys) for correct values

**Error:** `INVALID_ACCESS_TOKEN`

**Solution:**
1. Re-authenticate through Plaid Link
2. Ensure access token exchange completed successfully
3. Check backend logs for detailed error

### CORS Errors

**Error:** `Access to fetch at 'http://localhost:4001' from origin 'http://localhost:4000' has been blocked by CORS policy`

**Solution:**
1. Verify CORS is configured in `backend/server.js`
2. Check that backend is running on port 4001
3. Ensure frontend is making requests to correct backend URL

### Module Not Found

**Error:** `Cannot find module 'plaid'` or similar

**Solution:**
1. Navigate to correct directory (`backend/` or `frontend/`)
2. Run `npm install` again
3. Check `package.json` for correct dependencies
4. Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### WSL File System Issues

**Issue:** Slow performance or permission errors

**Solution:**
1. Keep project files in WSL filesystem (`~/projects/`) instead of Windows filesystem (`/mnt/c/`)
2. If using Windows filesystem, ensure proper permissions:
```bash
sudo chown -R $USER:$USER /mnt/c/path/to/project
```

### Network Connection Issues

**Error:** Cannot connect to Plaid API

**Solution:**
1. Check internet connection: `ping google.com`
2. Verify firewall settings
3. Check if corporate proxy is blocking requests
4. Test Plaid API directly: `curl https://sandbox.plaid.com`

### Transaction Data Not Loading

**Issue:** Transactions endpoint returns empty or error

**Solution:**
1. Verify access token is set (check backend logs)
2. Ensure date range calculation is correct
3. Check Plaid API response in backend logs
4. Verify bank account has transactions in test environment
5. Use test institution "First Platypus Bank" with `user_transactions_dynamic`

### Browser Issues

**Issue:** Application doesn't load in browser

**Solution:**
1. Clear browser cache
2. Try different browser
3. Check browser console for errors (F12)
4. Verify frontend server is running
5. Check for JavaScript errors in console

## Additional Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Dashboard](https://dashboard.plaid.com)
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [WSL Documentation](https://learn.microsoft.com/en-us/windows/wsl/)

## Next Steps

After successful setup:
1. Test the complete authentication flow
2. Verify transaction display
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
4. Check [PROJECT_STATE.md](PROJECT_STATE.md) for project status
5. Proceed to Step 2: Order matching implementation

## Support

If you encounter issues not covered in this guide:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Plaid API documentation
3. Check backend and frontend logs
4. Verify all environment variables are set correctly

---

**Last Updated:** 2026-02-XX
